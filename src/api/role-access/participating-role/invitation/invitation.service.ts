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
import { GetInvitationsQueryDto } from './dto/get.invittions.dto';
import { UpdateParticipantInvitationBodyDto } from './dto/update.invitation.dto';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async getInvitations(userId: string, query: GetInvitationsQueryDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      searchTerm,
      ...filters
    } = query;

    // Construct the Prisma `where` clause
    const where: Prisma.InvitationWhereInput = {
      ...filters, // Filters like projectId, status, invitedBy, etc.
      email: user.email,
      AND: searchTerm
        ? [
            {
              OR: [
                {
                  inviter: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
                {
                  project: {
                    title: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              ],
            },
          ]
        : undefined,
    };

    // Fetch invitations
    const invitations = await this.prisma.invitation.findMany({
      where,
      select: {
        id: true,
        status: true,
        sentAt: true,
        invitedBy: true,
        seen: true,
        seenAt: true,
        createdAt: true,
        inviter: {
          select: {
            email: true,
            id: true,
            profilePicture: {
              select: {
                minUrl: true,
              },
            },
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
    const total = await this.prisma.invitation.count({ where });

    return this.response
      .setSuccess(true)
      .setMessage('Invitations retrieved')
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

  async getSingleInvitations(userId: string, id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Fetch invitations
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id,
        email: user.email,
      },
      include: {
        inviter: {
          select: {
            email: true,
            id: true,
            profilePicture: {
              select: {
                minUrl: true,
                midUrl: true,
              },
            },
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            description: true,
            status: true,
            _count: {
              select: {
                participations: true,
                teams: true,
              },
            },
            creator: {
              select: {
                name: true,
                email: true,
                profilePicture: {
                  select: {
                    midUrl: true,
                    minUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found.');
    }

    return this.response
      .setSuccess(true)
      .setMessage('Invitations retrieved')
      .setData({ invitation });
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
        throw new ConflictException('Already a part of the project.');
      }

      const updatedInvitation = await tx.invitation.update({
        where: { id: invitationId },
        data: payload,
      });

      if (payload.status === 'ACCEPTED') {
        const participation = await tx.participation.create({
          data: {
            projectId: invitation.projectId,
            userId,
            invitationId: invitation.id,
            joinedAt: new Date(),
          },
        });

        const room = await tx.room.findFirst({
          where: {
            group: {
              project: {
                id: invitation.projectId,
              },
            },
          },
        });

        if (room) {
          await tx.roomParticipant.create({
            data: {
              roomId: room.id,
              userId: participation.userId,
            },
          });
        }
      }
      return null;
    });
    return this.response
      .setSuccess(true)
      .setMessage(`Invitation ${payload.status.toLowerCase()}.`)
      .setData(result);
  }

  async updateInvitationSeenStatus(
    userId: string, // The ID of the user making the request
    invitationId: string, // Passed as a parameter
    payload: UpdateParticipantInvitationBodyDto, // Fields to update, passed in the body
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const { seen } = payload;

    // Step 1: Fetch the invitation by ID and validate its existence
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId, email: user.email },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found.');
    }

    if (payload.seen) {
      if (!invitation.seen) {
        const updatedInvitation = await this.prisma.invitation.update({
          where: { id: invitationId },
          data: { seen, seenAt: seen ? new Date() : null },
        });
      }
    } else {
      if (invitation.seen) {
        const updatedInvitation = await this.prisma.invitation.update({
          where: { id: invitationId },
          data: { seen, seenAt: seen ? new Date() : null },
        });
      }
    }

    // if (!invitation.seen && payload.seen) {
    //   const updatedInvitation = await this.prisma.invitation.update({
    //     where: { id: invitationId },
    //     data: { seen, seenAt: seen ? new Date() : null },
    //   });
    // }

    return this.response
      .setSuccess(true)
      .setMessage('Invitation updated')
      .setData(null);
  }
}
