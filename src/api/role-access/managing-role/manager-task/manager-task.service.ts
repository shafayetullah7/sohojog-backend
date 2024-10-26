import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create.task.dto';
import { FileService } from 'src/shared/shared-modules/file/file.service';
import { Task } from '@prisma/client';
import { managerProjectHelper } from 'src/_helpers/access-helpers/manager-access/manager.project.helper';
import { UploadApiResponse } from 'cloudinary';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { QueryTaskDto } from './dto/query.task.dto';

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
            ManagerTasks: { create: { adminId: userId } },
            TaskAssignment: {
              createMany: {
                data: participationIds.map((id) => ({
                  participationId: id,
                })),
              },
            },
            TeamTaskAssignment: {
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

        return task;
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to create task and handle file upload',
          error.message,
        );
      }
    });

    return this.response
      .setSuccess(true)
      .setMessage('Task created successfully')
      .setData(result);
  }

  async getTasks(query: QueryTaskDto) {
    const {
      id, // Add id to query
      title,
      status,
      priority,
      projectId,
      taskAssignmentType,
      dueDateFrom,
      dueDateTo,
      sortBy, // Default sorting by createdAt
      sortOrder,
      page,
      limit,
      assignmentLimit, // Limit the number of task assignments fetched
    } = query;

    // Calculate pagination values
    const skip = (page - 1) * limit;
    const take = limit;

    // Build the dynamic Prisma query
    const where: any = {};

    // Add filters if they exist
    if (id) {
      where.id = id; // Query by exact id
    }
    if (title) {
      where.title = { contains: title, mode: 'insensitive' }; // Partial case-insensitive match on title
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (taskAssignmentType) {
      where.taskAssignmentType = taskAssignmentType;
    }

    // Filter by date range if provided
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {
        gte: dueDateFrom ? new Date(dueDateFrom) : undefined,
        lte: dueDateTo ? new Date(dueDateTo) : undefined,
      };
    }

    // Fetch tasks from Prisma with dynamic filtering, sorting, and pagination
    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take,
      include: {
        _count: {
          select: {
            TeamTaskAssignment: true, // Count the number of assigned teams
            TaskAssignment: true, // Count the number of task assignments
          },
        },
        TaskAssignment: {
          take: assignmentLimit, // Limit the number of task assignments fetched
          include: {
            participation: true, // Include participation details (or adjust as needed)
          },
        },
      },
    });

    // If no tasks found, you can optionally throw an exception
    if (!tasks.length) {
      throw new NotFoundException('No tasks found.');
    }

    // Return the tasks with the added data
    return {
      tasks,
      pagination: {
        page,
        limit,
        total: await this.prisma.task.count({ where }),
      },
    };
  }
}
