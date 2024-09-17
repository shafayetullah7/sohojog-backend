import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseBuilder } from 'src/shared/modules/response-builder/response.builder';
import { CreateInvitationBodyDto } from './dto/create.invitation';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/shared/modules/email/email.service';

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

      const project = await tx.project.findUnique({
        where: { id: projectId, managerId: userId },
        include: { manager: { select: { name: true, id: true } } },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const result = await tx.invitation.upsert({
        where: {
          projectId_email: {
            projectId: project.id,
            email,
          },
        },
        create: {
          email,
          message: payload.message,
          invitedBy: project.manager.id,
          projectId: project.id,
          invitedUserName: payload.invitedUserName,
          sentAt: new Date(),
        },
        update: {
          message: payload.message,
          invitedBy: project.manager.id,
          invitedUserName: payload.invitedUserName,
          sentAt: new Date(),
        },
      });

      if (sendEmail) {
        await this.emailService.sendProjectInvitationEmail({
          email,
          invitationLink: 'abc.com',
          inviterName: project.manager.name,
          projectName: project.title,
          invitedUserName: payload.invitedUserName,
          optionalMessage: payload.message,
        });
      }

      return result;
    });
    return this.response
      .setSuccess(true)
      .setMessage('Invitation sent')
      .setData(result);
  }
}
