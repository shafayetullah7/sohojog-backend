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
      include: {
        memberShips: {
          include: {
            teamLeader: {
              include: {
                membership: {
                  include: {
                    participation: {
                      include: {
                        user: true, // Assuming a user relation exists in Participation
                      },
                    },
                    team: true, // Include details of the team if needed
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(
        'Team not found.',
      );
    }

    return this.response
      .setSuccess(true)
      .setMessage('Team retrieved.')
      .setData(team);
  }
}
