import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamBodyDto } from './dto/create.team.dto';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { UpdateTeamBodyDto } from './dto/update.team.dto';
import { GetMyProjectTeamsQueryDto } from './dto/get.team.dto';
import { managerProjectHelper } from 'src/_helpers/access-helpers/manager-access/manager.project.helper';
import { managerTeamHelper } from 'src/_helpers/access-helpers/manager-access/manager.team.helper';
import { AssignTeamRoleDto } from './dto/assign.team.role.dto';
import { managerTeamMembershipHelpers } from 'src/_helpers/access-helpers/manager-access/manager.membership.helper';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async createTeam(userId: string, payload: CreateTeamBodyDto) {
    const { projectId, ...teamData } = payload;

    const managerProject = await managerProjectHelper.getManagerProject(
      this.prisma,
      userId,
      projectId,
    );

    if (!managerProject) {
      throw new NotFoundException('Project not found.');
    }

    const { project } = managerProject;

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

    return this.response
      .setSuccess(true)
      .setMessage('New team created.')
      .setData({ newTeam });
  }

  // async getTeamsByManager(userId: string, query: GetMyProjectTeamsQueryDto) {
  //   const { where, page, limit, sortBy, sortOrder } = query;

  //   const teams = await this.prisma.team.findMany({
  //     where: {
  //       ...where,
  //       project: {
  //         participations: {
  //           some: {
  //             userId,
  //             adminRole: { some: { active: true } },
  //           },
  //         },
  //         // AND: [

  //         // ],
  //       },
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       createdAt: true,
  //       projectId: true,
  //       status: true,
  //       memberShips: {
  //         select: {
  //           id: true,
  //           joinedAt: true,
  //           participation: {
  //             select: {
  //               user: {
  //                 select: {
  //                   name: true,
  //                   profilePicture: {
  //                     select: {
  //                       minUrl: true,
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         take: 3,
  //       },
  //       _count: {
  //         select: {
  //           memberShips: true,
  //           teamTaskAssignments: true,
  //         },
  //       },
  //     },
  //     skip: (page - 1) * limit,
  //     take: limit,
  //     orderBy: {
  //       [sortBy]: sortOrder,
  //     },
  //   });

  //   return this.response
  //     .setSuccess(true)
  //     .setMessage('Teams retrieved')
  //     .setData({ teams });
  // }

  async getTeamsByManager(userId: string, query: GetMyProjectTeamsQueryDto) {
    const {
      id,
      searchTerm,
      projectId,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    // Construct `where` clause
    const whereClause: Prisma.TeamWhereInput = {};

    if (id) {
      whereClause.id = id;
    }

    if (searchTerm) {
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { responsibilities: { hasSome: [searchTerm] } },
        { purpose: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Perform query
    const teams = await this.prisma.team.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        projectId: true,
        status: true,
        memberShips: {
          select: {
            id: true,
            joinedAt: true,
            participation: {
              select: {
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
          take: 3,
        },
        _count: {
          select: {
            memberShips: true,
            teamTaskAssignments: true,
          },
        },
      },
    });

    // Calculate total count for teams (for pagination)
    const totalItems = await this.prisma.team.count({
      where: whereClause,
    });

    // Format response
    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      projectId: team.projectId,
      createdAt: team.createdAt,
      status: team.status,
      counts: {
        memberCount: team._count.memberShips,
        taskAssignmentCount: team._count.teamTaskAssignments,
      },
      members: team.memberShips.map((membership) => ({
        id: membership.id,
        joinedAt: membership.joinedAt,
        userName: membership.participation.user.name,
        profilePictureUrl:
          membership.participation.user.profilePicture?.minUrl || null,
      })),
    }));

    // Pagination info
    const totalPages = Math.ceil(totalItems / limit);

    return this.response
      .setSuccess(true)
      .setMessage('Teams retrieved')
      .setData({
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems,
          totalPages,
        },
        teams: formattedTeams,
      });
  }

  async updateTeam(userId: string, teamId: string, payload: UpdateTeamBodyDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const managerTeam = managerTeamHelper.getManagerTeam(
        this.prisma,
        userId,
        teamId,
      );
      if (!managerTeam) {
        throw new NotFoundException('Team not found.');
      }

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

  async createTeamLeader(userId: string, payload: AssignTeamRoleDto) {
    const { membershipId, role, active } = payload;

    const managerMembership =
      await managerTeamMembershipHelpers.getManagerMembership(
        this.prisma,
        userId,
        membershipId,
      );

    if (!managerMembership) {
      throw new NotFoundException('Team membership not found');
    }

    const {
      member: { membership },
    } = managerMembership;

    const existingRole = await this.prisma.teamLeader.findUnique({
      where: {
        membershipId: membership.id,
      },
    });

    if (existingRole) {
      throw new BadRequestException('Role already assigned to the team member');
    }

    const teamMemberRole = await this.prisma.teamLeader.create({
      data: {
        membershipId: membership.id,
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Member role defined.')
      .setData(teamMemberRole);
  }
}
