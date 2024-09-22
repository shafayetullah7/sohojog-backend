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
    const { projectId, responsibilities, ...teamData } = payload;

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
        TeamResponsibility: {
          create: responsibilities?.length
            ? responsibilities.map((responsibility) => ({
                responsibility,
              }))
            : [],
        },
      },
    });

    return newTeam;
  }

  async getTeamsByManager(userId: string, query: GetMyProjectTeamsQueryDto) {
    const teams = await this.prisma.team.findMany({
      where: {
        project: {
          AND: [
            { id: query.projectId },
            {
              participations: {
                some: {
                  userId,
                  adminRole: { some: { role: ProjectAdminRole.MANAGER } },
                },
              },
            },
          ],
        },
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        status: query.status,
        purpose: {
          contains: query.purpose,
          mode: 'insensitive',
        },
        projectId: query.projectId,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: {
        [query.sortBy]: query.sortOrder,
      },
    });

    return teams;
  }

  async updateTeam(userId: string, teamId: string, payload: UpdateTeamBodyDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const { addResponsibilities, removeResponsibilities, ...rest } = payload;

      // Find the team, ensure the user is an admin or has permission
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
        include: {
          TeamResponsibility: {
            select: {
              id: true,
              responsibility: true,
            },
          },
        },
      });

      if (!team) {
        throw new NotFoundException('Team not found.');
      }

      // Handle removing responsibilities
      if (removeResponsibilities?.length) {
        removeResponsibilities.forEach((responsibilityId) => {
          if (
            !team.TeamResponsibility.find(
              (resp) => resp.id === responsibilityId,
            )
          ) {
            throw new NotFoundException(
              'Some responsibilities you are trying to remove are not found on the team.',
            );
          }
        });
      }

      // Handle adding responsibilities
      if (addResponsibilities?.length) {
        const remainingResponsibilities = [...team.TeamResponsibility].filter(
          (resp) => !removeResponsibilities?.includes(resp.id),
        );

        addResponsibilities.forEach((responsibilityName) => {
          if (
            remainingResponsibilities.find(
              (resp) =>
                resp.responsibility.toLowerCase() ===
                responsibilityName.toLowerCase(),
            )
          ) {
            throw new ConflictException(
              'Some responsibilities you are adding already exist on the team.',
            );
          }
        });

        if (
          remainingResponsibilities.length + addResponsibilities.length >
          10
        ) {
          throw new BadRequestException('Too many responsibilities');
        }
      }

      // Perform responsibility deletions
      if (removeResponsibilities?.length) {
        await tx.teamResponsibility.deleteMany({
          where: { id: { in: removeResponsibilities } },
        });
      }

      // Update the team with new responsibilities
      const updatedTeam = await tx.team.update({
        where: { id: teamId },
        data: {
          ...rest,
          TeamResponsibility: {
            create:
              addResponsibilities?.map((responsibility) => ({
                responsibility,
              })) || [],
          },
        },
        include: { TeamResponsibility: true },
      });

      return updatedTeam;
    });

    return this.response
      .setSuccess(true)
      .setMessage('Team updated successfully')
      .setData(result);
  }
}
