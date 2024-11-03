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
      ...rest
    } = query;

    const whereClause: Prisma.ParticipationWhereInput = {
      ...rest,
    };

    if (searchTerm) {
      whereClause.OR = [
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

    const participations = await this.prisma.participation.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            tags: true,
          },
        },
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Participations retreived.')
      .setData({ participations });
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
