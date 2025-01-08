import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { QueryTaskDto } from './dto/get.participant.tasks.dto';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { AssignmentSubmissionDto } from './dto/submit.task.dto';
import { UploadApiResponse } from 'cloudinary';
import { FileService } from 'src/shared/shared-modules/file/file.service';

@Injectable()
export class ParticipantTasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
    private readonly fileService: FileService,
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
                  assignmentSubmission: { status: submissionStatus },
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
        budget: true,
        // inableBudget: true,
        taskAssignmentType: true,
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
          },
        },
        teamTaskAssignment: {
          take: 2,
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
        taskSubmission: {
          select: {
            id: true,
            description: true,
            submittedBy: true,
            status: true,
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
            participation: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    profilePicture: {
                      select: {
                        id: true,
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
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.response
      .setSuccess(true)
      .setMessage('Single task fetched')
      .setData({ task });
  }

  async submitTask(
    userId: string,
    payload: AssignmentSubmissionDto,
    files: UploadApiResponse[] = [],
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // Fetch the task within the transaction
      const task = await prisma.task.findFirst({
        where: {
          id: payload.taskId,
          taskAssignment: {
            some: {
              participation: {
                userId,
              },
            },
          },
        },
        include: {
          taskSubmission: true,
          taskAssignment: {
            where: {
              participation: {
                userId,
              },
            },
            include: {
              assignmentSubmission: true,
              participation: true,
            },
          },
        },
      });

      // Validation logic inside the transaction
      if (!task) {
        throw new NotFoundException('Task not found.');
      }

      if (task.status !== 'TODO') {
        throw new BadRequestException(
          'Assignment submission is not available.',
        );
      }

      if (
        !task.taskAssignment?.length ||
        task.taskAssignment[0].participation?.userId !== userId
      ) {
        throw new NotFoundException('Task assignment not found.');
      }
      if (task.taskAssignmentType === 'GROUP') {
        if (task.taskSubmission) {
          throw new ConflictException(
            'Task already has submission. Please remove it to submit again.',
          );
        }
      } else {
        if (task.taskAssignment?.length) {
          const assignment = task.taskAssignment.find(
            (assignment) => assignment.participation?.userId === userId,
          );
          if (!assignment) {
            throw new NotFoundException('Task assignment not found.');
          }
          if (assignment.assignmentSubmission) {
            throw new ConflictException(
              'Already submitted. Please remove submission to submit again.',
            );
          }
        }
      }

      const uploadedFiles = await this.fileService.insertMultipleFiles(
        files,
        userId,
      );

      if (task.taskAssignmentType === 'GROUP') {
        const participation = task.taskAssignment[0].participation;
        const taskSubmission = await prisma.taskSubmission.create({
          data: {
            description: payload.description,
            taskId: task.id,
            submittedBy: participation.id,
          },
        });
        const submissionFiles = await prisma.submissionFile.createMany({
          data: uploadedFiles.map((file) => ({
            fileId: file.id,
            submissionId: taskSubmission.id,
          })),
        });
      } else {
        if (task.taskAssignment?.length) {
          const assignment = task.taskAssignment.find(
            (assignment) => assignment.participation?.userId === userId,
          );
          if (!assignment) {
            throw new NotFoundException('Task assignment not found.');
          }
          if (assignment.assignmentSubmission) {
            throw new ConflictException(
              'Already submitted. Please remove submission to submit again.',
            );
          }
          const submission = await prisma.assignmentSubmission.create({
            data: {
              description: payload.description,
              assignmentId: assignment.id,
            },
          });
          const submissionFiles = await prisma.submissionFile.createMany({
            data: uploadedFiles.map((file) => ({
              fileId: file.id,
              assignmentSubmissionId: submission.id,
            })),
          });
        }
      }

      return this.response
        .setSuccess(true)
        .setMessage('Submission done')
        .setData({ data: null }); // Return the created submission
    });
  }
}
