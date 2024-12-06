import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';

@Injectable()
export class ProjectPropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async getSingleProjectTeam(
    userId: string,
    projectId: string,
    teamId: string,
  ) {
    // Query 1: Fetch the team details
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        projectId,
        project: {
          participations: {
            some: {
              userId,
              adminRole: {
                some: {
                  active: true,
                },
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found.');
    }

    // Query 2: Fetch the team leader
    const teamLeader = await this.prisma.teamLeader.findFirst({
      where: {
        membership: {
          teamId,
        },
        active: true,
      },
      include: {
        membership: {
          select: {
            participation: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    profilePicture: {
                      select: {
                        minUrl: true,
                      },
                    },
                  },
                },
                joinedAt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    const formattedTeamLeader = teamLeader
      ? {
          id: teamLeader.membership.participation.user.id,
          name: teamLeader.membership.participation.user.name,
          profilePicture:
            teamLeader.membership.participation.user.profilePicture?.minUrl ||
            null,
          joinedAt: teamLeader.membership.participation.joinedAt,
          isActive: teamLeader.active,
          assignedAsLeaderAt: teamLeader.createdAt,
        }
      : null;

    const formattedTeam = {
      ...team,
      teamLeader: formattedTeamLeader,
    };

    return this.response
      .setSuccess(true)
      .setMessage('Team and leader retrieved successfully.')
      .setData({ team: formattedTeam });
  }
}
