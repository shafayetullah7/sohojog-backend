import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';

@Injectable()
export class ParticipantProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async getProjects(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        participations: {
          some: {
            userId,
            adminRole: {
              none: {},
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        status: true,
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
          take: 3,
        },
      },
    });

    const modifiedProjects = projects.map((project) => {
      const modifiedDescription = project.description?.slice(0, 250) + '...';
      project.description = modifiedDescription;
      return project;
    });

    return this.response
      .setSuccess(true)
      .setMessage('Projects fetched')
      .setData({ projects: modifiedProjects });
  }

  async getSingleProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        participations: {
          some: {
            userId,
            adminRole: {
              none: {},
            },
          },
        },
      },
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
        _count: {
          select: {
            participations: true,
            tasks: true,
            teams: true,
          },
        },
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Project retrieved')
      .setData({ project });
  }
}
