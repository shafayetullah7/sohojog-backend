import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamMembershipDto } from './dto/create.team.membership.dto';
import { managerTeamHelper } from 'src/_helpers/access-helpers/manager-access/manager.team.helper';
import { AddRoleToMemberDto } from './dto/add.member.role.dto';
import { managerTeamMembershipHelpers } from 'src/_helpers/access-helpers/manager-access/manager.membership.helper';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { TeamMembershipQueryDto } from './dto/get.membership.dto';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class TeamMembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async createTeamMembership(userId: string, payload: CreateTeamMembershipDto) {
    const { teamId } = payload;
    const managerTeam = await managerTeamHelper.getManagerTeam(
      this.prisma,
      userId,
      teamId,
    );

    if (!managerTeam) {
      throw new NotFoundException('Team not found.');
    }

    const participation = await this.prisma.participation.findUnique({
      where: {
        id: payload.participationId,
        project: { id: managerTeam.project.id },
      },
    });

    if (!participation) {
      throw new NotFoundException('Participant not found.');
    }
    const existingMembership = await this.prisma.teamMembership.findUnique({
      where: {
        participationId_teamId: {
          participationId: payload.participationId,
          teamId: teamId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException(
        'Participator is already a member of this team.',
      );
    }

    const newMembership = await this.prisma.teamMembership.create({
      data: {
        ...payload,
        joinedAt: new Date(),
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('New membership created')
      .setData({ membership: newMembership });
  }

  async addTeamLeader(userId: string, payload: AddRoleToMemberDto) {}

  async getMemberships(userId: string, query: TeamMembershipQueryDto) {
    const {
      teamId,
      participationId,
      projectId,
      role,
      active,
      joinedFrom,
      joinedTo,
      searchTerm,
      page,
      limit,
    } = query;

    const whereClause: Prisma.TeamMembershipWhereInput = {
      ...(teamId && { teamId }),
      ...(participationId && { participationId }),
      ...(projectId && { participation: { projectId } }),
      ...(role && { roles: { has: role } }),
      ...(active !== undefined && { active }),
      ...(joinedFrom || joinedTo
        ? {
            joinedAt: {
              gte: joinedFrom ? dayjs(joinedFrom).toDate() : undefined,
              lte: joinedTo ? dayjs(query.joinedTo).toDate() : undefined,
            },
          }
        : {}),
      ...(searchTerm
        ? {
            OR: [
              {
                participation: {
                  user: { name: { contains: searchTerm, mode: 'insensitive' } },
                },
              },
            ],
          }
        : {}),
    };

    // Fetch total count of memberships for pagination
    const totalItems = await this.prisma.teamMembership.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalItems / query.limit);

    // Fetch paginated memberships
    const memberships = await this.prisma.teamMembership.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        joinedAt: true,
        teamId: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        participation: {
          select: {
            user: {
              select: {
                name: true,
                id: true,
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
    });

    return this.response
      .setSuccess(true)
      .setMessage('Memberships retrieved.')
      .setData({
        memberships,
        pagination: {
          currentPage: page,
          totalItems,
          totalPages,
          pageSize: limit,
        },
      });
  }
}
