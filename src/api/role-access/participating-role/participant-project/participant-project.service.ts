import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';

@Injectable()
export class ParticipantProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async getProjects(userId: string) {
    const participations = await this.prisma.participation.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        joinedAt: true,
        project: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            startDate: true,
            endDate: true,
            status: true,
            creator: {
              select: {
                name: true,
                profilePicture: {
                  select: {
                    minUrl: true,
                  },
                },
              },
            },
            _count: {
              select: {
                teams: true,
                participations: true,
                tasks: {
                  where: {
                    taskAssignment: {
                      some: {
                        participation: {
                          userId,
                        },
                      },
                    },
                    status: 'TODO',
                  },
                },
              },
            },
            participations: {
              select: {
                id: true,
                joinedAt: true,
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
              },
              take: 3,
            },
          },
        },
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Projects fetched')
      .setData({ participations });
  }

  async getSingleProject(userId: string, participationId: string) {
    console.log({ userId, participationId });
    const participation = await this.prisma.participation.findFirst({
      where: {
        id: participationId,
        userId,
      },
      include: {
        project: {
          include: {
            creator: {
              select: {
                name: true,
                profilePicture: {
                  select: {
                    minUrl: true,
                    midUrl: true,
                    fullUrl: true,
                  },
                },
              },
            },
            participations: {
              where: {
                userId,
              },
              select: {
                id: true,
                joinedAt: true,
                user: {
                  select: {
                    name: true,
                    profilePicture: {
                      select: {
                        minUrl: true,
                      },
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                participations: true,
                tasks: true,
                teams: true,
              },
            },
          },
        },
      },
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    return this.response
      .setSuccess(true)
      .setMessage('Project retrieved')
      .setData({ participation });
  }
}
