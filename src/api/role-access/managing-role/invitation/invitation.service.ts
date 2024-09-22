import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseBuilder } from 'src/shared/modules/response-builder/response.builder';
import { CreateInvitationBodyDto } from './dto/create.invitation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/shared/modules/email/email.service';
import { GetInvitationsQueryDto } from './dto/get.invitation.dto';
import { Prisma, ProjectAdminRole } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async sendInvitation(userId: string, payload: CreateInvitationBodyDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const { projectId, email, sendEmail } = payload;

      const projectAdmin = await tx.projectAdmin.findFirst({
        where: {
          participation: {
            userId, // Check if the user is part of the project
            projectId, // Check for the specific project
          },
          role: ProjectAdminRole.MANAGER, // Role can be adjusted as per your requirement
          active: true, // Check if the admin is active
        },
        include: { participation: { select: { userId: true } } }, // Include participation for validation
      });

      if (!projectAdmin) {
        throw new ForbiddenException(
          'You do not have permission to send invitations for this project.',
        );
      }

      // Upsert the invitation
      const invitation = await tx.invitation.upsert({
        where: {
          projectId_email: {
            projectId: projectId,
            email,
          },
        },
        create: {
          email,
          message: payload.message,
          invitedBy: projectAdmin.participation.userId,
          projectId: projectId,
          invitedUserName: payload.invitedUserName,
          sentAt: new Date(),
        },
        update: {
          message: payload.message,
          invitedBy: projectAdmin.participation.userId,
          invitedUserName: payload.invitedUserName,
          sentAt: new Date(),
        },
      });

      // Send the email if required
      if (sendEmail) {
        await this.emailService.sendProjectInvitationEmail({
          email,
          invitationLink: 'abc.com', // Replace with real link generation logic
          inviterName: 'Admin', // Replace with the inviter's name
          projectName: 'Project Title', // Replace with the project name
          invitedUserName: payload.invitedUserName,
          optionalMessage: payload.message,
        });
      }

      return invitation;
    });

    return this.response
      .setSuccess(true)
      .setMessage('Invitation sent successfully')
      .setData(result);
  }

  async getInvitationsByManager(userId: string, query: GetInvitationsQueryDto) {
    const { date, month, year, beforeDate, afterDate, page, limit, ...rest } =
      query;

    const prismaQuery: Prisma.InvitationWhereInput = {
      AND: [
        rest,
        {
          project: {
            participations: {
              some: {
                userId,
                adminRole: { some: { role: ProjectAdminRole.MANAGER } },
              },
            },
          },
        },
        date
          ? {
              sentAt: {
                gte: dayjs(date).startOf('day').toDate(),
                lte: dayjs(date).endOf('day').toDate(),
              },
            }
          : {},
        month
          ? {
              sentAt: {
                gte: month.startOfMonth,
                lte: month.endOfMonth,
              },
            }
          : {},
        year
          ? {
              sentAt: {
                gte: year.startOfYear,
                lte: year.endOfYear,
              },
            }
          : {},
        beforeDate ? { sentAt: { lte: beforeDate } } : {},
        afterDate ? { sentAt: { gte: afterDate } } : {},
      ],
    };

    const invitations = await this.prisma.invitation.findMany({
      where: prismaQuery,
      skip: (page - 1) * (limit || 15),
      take: limit || 15,
    });

    return this.response
      .setSuccess(true)
      .setMessage('Invitations retrieved')
      .setData(invitations);
  }
}
