import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create.task.dto';
import { FileService } from 'src/shared/shared-modules/file/file.service';
import { Prisma, Task } from '@prisma/client';
import { managerProjectHelper } from 'src/_helpers/access-helpers/manager-access/manager.project.helper';
import { UploadApiResponse } from 'cloudinary';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { QueryTaskDto } from './dto/query.task.dto';
import dayjs from 'dayjs';

@Injectable()
export class ManagerTaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async createTask(
    userId: string,
    payload: CreateTaskDto,
    files: UploadApiResponse[] = [],
  ): Promise<ResponseBuilder<Task>> {
    const { projectId } = payload;
    const { assignedTeams, assigneeIds, ...taksData } = payload;

    // Start the transaction
    const result = await this.prisma.$transaction(async (prismaTransaction) => {
      try {
        // Insert the task
        const managerProject = await managerProjectHelper.getManagerProject(
          prismaTransaction,
          userId,
          projectId,
        );

        if (!managerProject) {
          throw new NotFoundException('Project Not found.');
        }

        const {
          manager: { adminRole, participation, user },
        } = managerProject;

        let participationIds: string[] = [];

        if (assigneeIds?.length) {
          const assignees = await prismaTransaction.participation.findMany({
            where: { id: { in: assigneeIds }, projectId },
          });

          participationIds = assignees.map((assignee) => assignee.id);

          assigneeIds.forEach((id) => {
            if (!participationIds.includes(id)) {
              throw new NotFoundException('Assignee not found.');
            }
          });
        }

        let teamIds: string[] = [];

        if (assignedTeams?.length) {
          const teams = await prismaTransaction.team.findMany({
            where: { id: { in: assignedTeams }, projectId },
          });

          teamIds = teams.map((team) => team.id);

          assignedTeams.forEach((id) => {
            if (!teamIds.includes(id)) {
              throw new NotFoundException('Team not found.');
            }
          });
        }

        const task = await prismaTransaction.task.create({
          data: {
            ...taksData,
            createdBy: userId,
            managerTasks: { create: { adminId: adminRole.id } },
            taskAssignment: {
              createMany: {
                data: participationIds.map((id) => ({
                  participationId: id,
                })),
              },
            },
            teamTaskAssignment: {
              createMany: {
                data: teamIds.map((id) => ({
                  teamId: id,
                  assignedBy: adminRole.id,
                })),
              },
            },
          },
        });

        if (files?.length) {
          const uploadedFiles = await this.fileService.insertMultipleFiles(
            files,
            userId,
            prismaTransaction,
          );

          if (uploadedFiles.length) {
            const attachmentData = uploadedFiles.map((file) => {
              return {
                taskId: task.id,
                fileId: file.id,
              };
            });

            const taskAttachments =
              await prismaTransaction.taskAttachments.createMany({
                data: attachmentData,
              });
          }
        }

        const createdTask = await prismaTransaction.task.findUnique({
          where: { id: task.id },
          include: {
            taskAttachments: true,
            managerTasks: true,
          },
        });

        return createdTask;
      } catch (error) {
        throw error;
      }
    });

    return this.response
      .setSuccess(true)
      .setMessage('Task created successfully')
      .setData(result);
  }

  async getTasks(userId: string, query: QueryTaskDto) {
    const {
      id,
      title,
      status,
      priority,
      projectId,
      taskAssignmentType,
      dueDateFrom,
      dueDateTo,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
      assignmentLimit,
      dueDate,
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
      ],
      project: {
        creatorId: userId,
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
        taskAssignment: {
          take: assignmentLimit,
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
                        id: true,
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

    const totalRecords = await this.prisma.task.count({ where: prismaQuery });

    const result = {
      tasks,
      pagination: {
        page,
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
}
