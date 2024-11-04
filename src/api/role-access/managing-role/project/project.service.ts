import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { CreateProjectBodyDto } from './dto/create.project.dto';
import { GetMyProjectsQueryDto } from './dto/get.my.projets.dto';
import { UpdateProjectBodyDto } from './dto/update.project.dto';

@Injectable()
export class ProjectService {
  constructor(
    private readonly response: ResponseBuilder<any>,
    private readonly prisma: PrismaService,
  ) {}

  async createProject(userId: string, payload: CreateProjectBodyDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      // Check if a project with the same title exists for this creator
      const existingProject = await tx.project.findUnique({
        where: { creatorId_title: { creatorId: userId, title: payload.title } },
      });

      console.log('********', userId);

      // Throw an error if a project with the same title exists
      if (existingProject) {
        throw new ConflictException(
          'Already created a project with similar title',
        );
      }

      // Create the new project with an array of tags
      const newProject = await tx.project.create({
        data: {
          ...payload,
          creatorId: userId,
          participations: {
            create: {
              userId,
              joinedAt: new Date(),
              adminRole: {
                create: {},
              },
            },
          },
        },
        include: {
          participations: true, // Include participations if needed
        },
      });

      // Add the creator as a participant in the project
      // const participant = await tx.participation.create({
      //   data: {
      //     projectId: newProject.id,
      //     userId,
      //   },
      // });

      // // Assign the creator as the manager of the project
      // const manager = await tx.projectAdmin.create({
      //   data: {
      //     participationId: participant.id,
      //     role: ProjectAdminRole.MANAGER,
      //   },
      // });

      // Logging the new project for debugging
      // console.log(newProject);

      // Set the response object with success status and project data

      return newProject;
    });
    return this.response
      .setSuccess(true)
      .setMessage('New project created.')
      .setData({ project: result });
  }

  async getMyProjects(userId: string, query: GetMyProjectsQueryDto) {
    // Fetch projects and tasks counts in a single query using a raw query
    const projectsWithTaskCounts = await this.prisma.project.findMany({
      where: { ...query, creatorId: userId },
      include: {
        _count: {
          select: {
            participations: true,
            stakeholders: true,
            invitations: true,
            teams: true,
          },
        },
        participations: {
          take: 4,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
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
    });
  
    // Get task counts grouped by project in a single query
    const taskCounts = await this.prisma.task.groupBy({
      by: ['projectId', 'status'],
      _count: {
        status: true,
      },
      where: {
        projectId: {
          in: projectsWithTaskCounts.map(project => project.id), // Filter tasks for fetched projects
        },
      },
    });
  
    // Prepare a map for easy access to task counts by projectId
    const taskCountsMap = taskCounts.reduce((acc, { projectId, status, _count }) => {
      acc[projectId] = acc[projectId] || { total: 0, todo: 0, done: 0 };
      acc[projectId].total += _count.status;
      if (status === 'TODO') {
        acc[projectId].todo = _count.status;
      } else if (status === 'DONE') {
        acc[projectId].done = _count.status;
      }
      return acc;
    }, {});
  
    // Enrich projects with task counts
    const enrichedProjects = projectsWithTaskCounts.map(project => {
      const taskCount = taskCountsMap[project.id] || { total: 0, todo: 0, done: 0 };
      return {
        ...project,
        description: project.description?.length
          ? project.description.length > 150
            ? `${project.description.substring(0, 150)}...`
            : project.description
          : project.description,
        taskCounts: taskCount,
      };
    });
  
    return this.response
      .setSuccess(true)
      .setMessage('Projects retrieved.')
      .setData({ projects: enrichedProjects });
  }
  

  async updateProject(
    userId: string,
    projectId: string,
    payload: UpdateProjectBodyDto,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId, creatorId: userId },
      });

      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      const result = await tx.project.update({
        where: { id: projectId },
        data: {
          ...payload,
        },
      });

      return result;
    });
    // console.log(result);

    return this.response
      .setSuccess(true)
      .setMessage('Project updated')
      .setData(result);
  }
}
