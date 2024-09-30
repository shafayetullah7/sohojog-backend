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

  async addRoleToMember(userId: string, payload: AddRoleToMemberDto) {
    const managedMembership =
      await managerTeamMembershipHelpers.getManagerMembership(
        this.prisma,
        userId,
        payload.membershipId,
      );

    if (!managedMembership) {
      throw new NotFoundException('Membership not found.');
    }

    const existingRole = await this.prisma.teamMemberRole.findUnique({
      where: {
        membershipId_role: {
          membershipId: payload.membershipId,
          role: payload.role,
        },
      },
    });

    if (existingRole) {
      throw new BadRequestException(
        'This role is already assigned to the member.',
      );
    }

    const newRole = await this.prisma.teamMemberRole.create({
      data: {
        membershipId: payload.membershipId,
        role: payload.role,
      },
      include: {
        membership: true,
      },
    });

    const { membership, ...restRole } = newRole;
    const result = { newRole };

    return this.response
      .setSuccess(true)
      .setMessage('Team role assigned')
      .setData({ role: newRole });
  }

  async getMemberships(userId: string, query: TeamMembershipQueryDto) {
    const memberships = await this.prisma.teamMembership.findMany({
      where: { ...query?.where, },
    });
  }
}
