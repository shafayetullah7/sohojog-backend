import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamBodyDto } from './dto/create.team.dto';
import { ProjectAdminRole } from '@prisma/client';
import { ResponseBuilder } from 'src/shared/modules/response-builder/response.builder';
import { UpdateTeamBodyDto } from './dto/update.team.dto';
import { GetMyProjectTeamsQueryDto } from './dto/get.team.dto';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async createTeam(userId: string, payload: CreateTeamBodyDto) {
    const { projectId, ...teamData } = payload;

    // Check if the user is a Project Admin with a role of MANAGER for the specified project
    const project = await this.prisma.project.findFirst({
      where: {
        AND: [
          { id: projectId },
          {
            participations: {
              some: {
                userId: userId,
                adminRole: {
                  some: { role: ProjectAdminRole.MANAGER, active: true },
                },
              },
            },
          },
        ],
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const existingTeam = await this.prisma.team.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: payload.name,
        },
      },
    });

    if (existingTeam) {
      throw new ConflictException(
        `'${payload.name}' team already exists within the project.`,
      );
    }

    const newTeam = await this.prisma.team.create({
      data: {
        ...teamData,
        projectId: projectId,
      },
    });

    return newTeam;
  }

  async getTeamsByManager(userId: string, query: GetMyProjectTeamsQueryDto) {
    const { where, page, limit, sortBy, sortOrder } = query;

    const teams = await this.prisma.team.findMany({
      where: {
        ...where,
        project: {
          participations: {
            some: {
              userId,
              adminRole: { some: { role: ProjectAdminRole.MANAGER } },
            },
          },
          // AND: [

          // ],
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return teams;
  }

  async updateTeam(userId: string, teamId: string, payload: UpdateTeamBodyDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const team = await tx.team.findFirst({
        where: {
          id: teamId,
          project: {
            participations: {
              some: {
                userId: userId,
                adminRole: {
                  some: { role: 'MANAGER', active: true }, // Example check for admin role
                },
              },
            },
          },
        },
      });

      if (!team) {
        throw new NotFoundException('Team not found.');
      }

      // Handle removing responsibilities

      // Update the team with new responsibilities
      const updatedTeam = await tx.team.update({
        where: { id: teamId },
        data: {
          ...payload,
        },
      });

      return updatedTeam;
    });

    return this.response
      .setSuccess(true)
      .setMessage('Team updated successfully')
      .setData(result);
  }
}
