import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectPropertiesService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new Error('Team not found or you do not have access to this team.');
    }

    return team;
  }
}
