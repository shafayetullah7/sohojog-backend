import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InviteStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { InvitationResponseBodyDto } from './dto/invitation.response.dto';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async getInvitations(userId: string, query: Prisma.InvitationWhereInput) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      ...filters
    } = query as any;

    // Construct the Prisma findMany query based on filters and pagination
    const invitations = await this.prisma.invitation.findMany({
      where: {
        ...filters, // Applies any filters provided in the query, like projectId, status, etc.
      },
      include: {
        inviter: {
          select: {
            email: true,
            id: true,
            profilePicture: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Get total count for pagination metadata
    const total = await this.prisma.invitation.count({
      where: {
        ...filters,
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Invitations retreived')
      .setData({
        invitations,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
      });
  }

  async respondToInvitation(
    userId: string,
    invitationId: string,
    payload: InvitationResponseBodyDto,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }
      const invitation = await tx.invitation.findUnique({
        where: {
          id: invitationId,
          email: user.email,
        },
      });

      if (!invitation || invitation.email !== user.email) {
        throw new NotFoundException('Invitation not found.');
      }

      if (invitation.status !== InviteStatus.PENDING) {
        throw new BadRequestException(
          `Inviation is already ${invitation.status.toLowerCase()}.`,
        );
      }

      const existingParticipation = await tx.participation.findFirst({
        where: { userId, projectId: invitation.projectId },
      });

      if (existingParticipation) {
        throw new ConflictException('User is already a part of the project.');
      }

      const updatedInvitation = await tx.invitation.update({
        where: { id: invitationId },
        data: payload,
      });

      const participation = await tx.participation.create({
        data: {
          projectId: invitation.projectId,
          userId,
          invitationId: invitation.id,
        },
      });
      return { participation, invitation: updatedInvitation };
    });
    return this.response
      .setSuccess(true)
      .setMessage(`Invitation ${payload.status.toLowerCase()}.`)
      .setData(result);
  }
}
