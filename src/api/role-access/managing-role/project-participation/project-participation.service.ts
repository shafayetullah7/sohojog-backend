import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectParticipationQueryDto } from './dto/project.participation.query.dto';
import { Prisma } from '@prisma/client';
import { ResponseBuilder } from 'src/shared/modules/response-builder/response.builder';
import { ProjectParticipationUpdateDto } from './dto/project.participation.update.dto';

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
            image: true,
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
  ) {}
}
