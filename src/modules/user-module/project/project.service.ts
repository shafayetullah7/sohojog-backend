import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProjectBodyDto } from './dto/create.project.dto';
import { ResponseBuilder } from 'src/modules/common/response-builder/response.builder';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetProjectsQueryDto } from './dto/get.projets.dto';

@Injectable()
export class ProjectService {
  constructor(
    private readonly response: ResponseBuilder<any>,
    private readonly prisma: PrismaService,
  ) {}
  async createProject(userId: string, payload: CreateProjectBodyDto) {
    const { tags, ...rest } = payload;
    const existingProject = await this.prisma.project.findUnique({
      where: { managerId_title: { managerId: userId, title: payload.title } },
    });
    if (existingProject) {
      throw new ConflictException(
        'Already created a project wits similar title',
      );
    }

    const newProject = await this.prisma.project.create({
      data: {
        ...rest,
        managerId: 'manager-id',
        tags: {
          create: tags.map((tag) => ({ tag })),
        },
      },
      include: {
        tags: true, // Include the tags in the response if you want to get them back
      },
    });

    console.log(newProject);
    this.response
      .setSuccess(true)
      .setMessage('New project created.')
      .setData(newProject);

    return true;
  }

  async getMyProjects(userId: string, query: GetProjectsQueryDto) {
    // const { searchKey, tagId, ...restQuery } = query;
    const projects = await this.prisma.project.findMany({
      where: { ...query, managerId: userId },
    });
    this.response
      .setSuccess(true)
      .setMessage('Projects retrieved.')
      .setData(projects);
  }
}
