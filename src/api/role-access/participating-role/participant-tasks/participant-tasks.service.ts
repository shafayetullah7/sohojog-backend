import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { QueryTaskDto } from './dto/get.participant.tasks.dto';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class ParticipantTasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async getParticipantTasks(userId: string, query: QueryTaskDto) {
    const {
      id,
      title,
      status,
      priority,
      projectId,
      teamId,
      submissionStatus,
      taskAssignmentType,
      dueDateFrom,
      dueDateTo,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
      assignmentLimit,
      dueDate,
      participationId,
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    const prismaQuery: Prisma.TaskWhereInput = {
      AND: [
        id ? { id } : {},
        title ? { title: { contains: title, mode: 'insensitive' } } : {},
        status ? { status } : {},
        priority ? { priority } : {},
        projectId ? { projectId } : {},
        taskAssignmentType ? { taskAssignmentType } : {},
        participationId
          ? {
              project: {
                participations: {
                  some: { id: participationId },
                },
              },
            }
          : {},
        dueDate
          ? {
              dueDate: {
                gte: dayjs(dueDate).startOf('day').toDate(),
                lte: dayjs(dueDate).endOf('day').toDate(),
              },
            }
          : {},
        dueDateTo ? { dueDate: { lte: new Date(dueDateTo) } } : {},
        dueDateFrom ? { dueDate: { gte: new Date(dueDateFrom) } } : {},
        teamId ? { teamTaskAssignment: { some: { teamId } } } : {},
        submissionStatus
          ? {
              taskAssignment: {
                some: {
                  participation: { userId },
                  assignmentSubmission: { some: { status: submissionStatus } },
                },
              },
            }
          : {},
      ],
      // project: {
      //   creatorId: userId,
      // },
      taskAssignment: {
        some: {
          participation: {
            userId,
          },
        },
      },
    };

    const tasks = await this.prisma.task.findMany({
      where: prismaQuery,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        projectId: true,
        _count: {
          select: {
            teamTaskAssignment: true,
            taskAssignment: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            creator: {
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
        },
        taskAssignment: {
          take: 1,
          select: {
            id: true,
            participation: {
              select: {
                id: true,
                role: true,
                status: true,
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
            _count:{
              select:{
                assignmentSubmission:true
              }
            },
          },
        },
        teamTaskAssignment: {
          take:2,
          select: {
            id: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        managerTasks: {
          select: {
            id: true,
            creator: {
              select: {
                participation: {
                  select: {
                    id: true,
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
              },
            },
          },
        },
      },
    });

    // const modifiedProjects =

    const totalRecords = await this.prisma.task.count({ where: prismaQuery });

    const result = {
      tasks,
      pagination: {
        limit,
        total: totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
      },
    };

    return this.response
      .setSuccess(true)
      .setMessage('Tasks retreived')
      .setData(result);
  }

  async getSingleTask(userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        taskAssignment: {
          some: {
            participation: {
              userId,
            },
          },
        },
      },
      include: {
        taskAttachments: {
          select: {
            id: true,
            file: {
              select: {
                id: true,
                file: true,
                fileName: true,
                fileType: true,
                extension: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            creator: {
              select: {
                id: true,
                name: true,
                profilePicture: {
                  select: {
                    midUrl: true,
                  },
                },
              },
            },
          },
        },
        teamTaskAssignment: {
          where: {
            team: {
              memberShips: {
                some: {
                  participation: {
                    userId,
                  },
                },
              },
            },
          },
          select: {
            id: true,
            team: {
              select: {
                id: true,
                name: true,
                memberShips: {
                  where: {
                    teamLeader: {},
                  },
                  select: {
                    teamLeader: {
                      select: {
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
                                        midUrl: true,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        taskAssignment: {
          where: {
            participation: {
              userId,
            },
          },
          include: {
            assignmentSubmission: {
              include: {
                submissionFile: {
                  select: {
                    id: true,
                    file: {
                      select: {
                        id: true,
                        file: true,
                        fileName: true,
                        fileType: true,
                        extension: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Single task fetched')
      .setData({ task });
  }

  // const
}
