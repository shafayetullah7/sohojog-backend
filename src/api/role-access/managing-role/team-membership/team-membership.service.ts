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
import { ResponseBuilder } from 'src/shared/modules/response-builder/response.builder';
import { TeamMembershipQueryDto } from './dto/get.membership.dto';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class TeamMembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async createTeamMembership(
    userId: string,
    teamId: string,
    payload: CreateTeamMembershipDto,
  ) {
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
        teamId,
        ...payload,
        joinedAt: new Date(),
      },
      include: {
        team: true,
        participation: true,
      },
    });

    // return newMembership;
    return this.response
      .setSuccess(true)
      .setMessage('New membership created')
      .setData({ membership: newMembership });
  }

  async addTeamLeader(userId: string, payload: AddRoleToMemberDto) {}

  async getMemberships(userId: string, query: TeamMembershipQueryDto) {
    const whereClause: Prisma.TeamMembershipWhereInput = {};

    if (query.teamId) {
      whereClause.teamId = query.teamId;
    }

    if (query.participationId) {
      whereClause.participationId = query.participationId;
    }

    if (query.projectId) {
      whereClause.participation = { projectId: query.projectId };
    }

    if (query.role) {
      whereClause.roles = { has: query.role };
    }

    if (query.joinedFrom || query.joinedTo) {
      whereClause.joinedAt = {};
      if (query.joinedFrom) {
        whereClause.joinedAt.gte = dayjs(query.joinedFrom).toDate();
        if (query.joinedTo) {
          whereClause.joinedAt.lte = dayjs(query.joinedTo).toDate();
        }
      }

      return {
        where: whereClause,
      };
    }
    const memberships = await this.prisma.teamMembership.findMany({
      where: {
        ...whereClause,
        team: {
          project: {
            participations: {
              some: {
                userId,
                adminRole: { some: { active: true } },
              },
            },
          },
        },
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Memberships retrieved')
      .setData(memberships);
  }
}
