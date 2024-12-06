import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectParticipationQueryDto } from './dto/project.participation.query.dto';
import { ParticipationStatus, Prisma } from '@prisma/client';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { ProjectParticipationUpdateDto } from './dto/project.participation.update.dto';
import { managerParticipationHelper } from 'src/_helpers/access-helpers/manager-access/manager.project.participation.helper';

@Injectable()
export class ProjectParticipationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async getProjectParticipations(
    userId: string,
    query: ProjectParticipationQueryDto,
  ) {
    const {
      searchTerm,
      page = 1,
      limit = 10,
      joinedFrom,
      joinedTo,
      excludeTeam,
      ...rest
    } = query;

    const whereClause: Prisma.ParticipationWhereInput = {
      ...rest,
      teamMemberships: {
        none: {
          teamId: excludeTeam,
        },
      },
    };

    if (searchTerm) {
      whereClause.OR = [
        {
          project: {
            participations: {
              some: { adminRole: { some: { participation: { userId } } } },
            },
          },
        },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
        { project: { title: { contains: searchTerm, mode: 'insensitive' } } },
        {
          project: {
            description: { contains: searchTerm, mode: 'insensitive' },
          },
        },
        { project: { tags: { hasSome: [searchTerm] } } },
      ];
    }

    if (joinedFrom || joinedTo) {
      whereClause.joinedAt = {
        ...(joinedFrom ? { gte: new Date(joinedFrom) } : {}),
        ...(joinedTo ? { lte: new Date(joinedTo) } : {}),
      };
    }

    // Fetch total count of matching participations
    const totalItems = await this.prisma.participation.count({
      where: whereClause,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated participations
    const participations = await this.prisma.participation.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        designation: true,
        status: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: {
              select: {
                minUrl: true,
              },
            },
          },
        },
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Participations retrieved.')
      .setData({
        participations,
        pagination: {
          currentPage: page,
          totalItems,
          totalPages,
          pageSize: limit,
        },
      });
  }

  async updateProjectParticipations(
    userId: string,
    participationId: string,
    payload: ProjectParticipationUpdateDto,
  ) {
    const managerParticipation =
      await managerParticipationHelper.getManagerParticipant(
        this.prisma,
        userId,
        participationId,
      );

    if (!managerParticipation) {
      throw new NotFoundException('Participation not found.');
    }
    const { participation } = managerParticipation;
    if (participation.participation.status === ParticipationStatus.REMOVED) {
      throw new BadRequestException(
        'Participant has already been removed from he project.',
      );
    }

    const updatedParticipation = await this.prisma.participation.update({
      where: { id: participationId },
      data: payload,
    });

    return this.response
      .setSuccess(true)
      .setMessage('Participation updated')
      .setData(updatedParticipation);
  }
}
