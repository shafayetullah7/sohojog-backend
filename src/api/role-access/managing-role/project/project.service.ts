import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/modules/response-builder/response.builder';
import { CreateProjectBodyDto } from './dto/create.project.dto';
import { GetMyProjectsQueryDto } from './dto/get.my.projets.dto';
import { UpdateProjectBodyDto } from './dto/update.project.dto';
import { ProjectAdminRole } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(
    private readonly response: ResponseBuilder<any>,
    private readonly prisma: PrismaService,
  ) {}
  async createProject(userId: string, payload: CreateProjectBodyDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const { tags, ...rest } = payload;
      const existingProject = await tx.project.findUnique({
        where: { creatorId_title: { creatorId: userId, title: payload.title } },
      });
      if (existingProject) {
        throw new ConflictException(
          'Already created a project with similar title',
        );
      }

      // console.log();

      const newProject = await tx.project.create({
        data: {
          ...rest,
          creatorId: userId,
          tags: {
            create: tags.map((tag) => ({ tag })),
          },
        },
        include: {
          tags: true,
        },
      });

      const participant = await tx.participation.create({
        data: {
          projectId: newProject.id,
          userId,
        },
      });

      const manager = await tx.projectAdmin.create({
        data: {
          participationId: participant.id,
          role: ProjectAdminRole.MANAGER,
        },
      });

      console.log(newProject);
      this.response
        .setSuccess(true)
        .setMessage('New project created.')
        .setData(newProject);

      return this.response;
    });
  }

  async getMyProjects(userId: string, query: GetMyProjectsQueryDto) {
    // const { searchKey, tagId, ...restQuery } = query;
    const projects = await this.prisma.project.findMany({
      where: { ...query, creatorId: userId },
    });
    return this.response
      .setSuccess(true)
      .setMessage('Projects retrieved.')
      .setData(projects);
  }

  async updateProject(
    userId: string,
    projectId: string,
    payload: UpdateProjectBodyDto,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      const { addTags, removeTags, ...rest } = payload;
      const project = await tx.project.findUnique({
        where: { id: projectId, creatorId: userId },
        include: {
          tags: {
            select: {
              id: true,
              tag: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      if (removeTags?.length) {
        removeTags.forEach((tagId) => {
          if (!project.tags.find((tag) => tag.id === tagId)) {
            throw new NotFoundException(
              'Some tags you are trying to remove are not found on the project.',
            );
          }
        });
      }

      if (addTags?.length) {
        const remainingTags = [...project.tags].filter(
          (tag) => !removeTags?.includes(tag.id),
        );

        addTags.forEach((tagStr) => {
          if (
            remainingTags.find(
              (tag) => tag.tag.toLowerCase() === tagStr.toLowerCase(),
            )
          ) {
            throw new ConflictException(
              'Some tags you’re adding already exist.',
            );
          }
        });

        if (remainingTags.length + addTags.length > 10) {
          throw new BadRequestException('Too many tags');
        }
      }

      if (removeTags?.length) {
        const deleteResult = await tx.projectTag.deleteMany({
          where: { id: { in: removeTags } },
        });
      }
      const result = await tx.project.update({
        where: { id: projectId },
        data: {
          ...rest,
          tags: { create: addTags?.map((tag) => ({ tag })) || [] },
        },
        include: { tags: true },
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
