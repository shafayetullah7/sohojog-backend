import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamBodyDto } from './dto/create.team.dto';
import { ProjectAdminRole } from '@prisma/client';
import { ResponseBuilder } from 'src/shared/modules/response-builder/response.builder';
import { UpdateTeamBodyDto } from './dto/update.team.dto';

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

    const newTeam = await this.prisma.team.create({
      data: {
        ...teamData,
        projectId: projectId,
      },
    });

    // Optionally, you can add the creator as a team member or perform additional actions here

    return newTeam; // Return the newly created team
  }

  async updateTeam(userId: string, teamId: string, payload: UpdateTeamBodyDto) {
    const { ...teamData } = payload;

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { project: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const { projectId } = team; // Extract the projectId from the team

    // Step 2: Check if the user is a Project Admin with a MANAGER role for the project the team belongs to
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

    // Step 3: If the user is not authorized, throw an error
    if (!project) {
      throw new NotFoundException('User is not authorized to update this team');
    }

    // Step 4: Update the team with the new data
    const updatedTeam = await this.prisma.team.update({
      where: { id: teamId },
      data: {
        ...teamData, // Spread the updated team data (e.g., name, purpose, status)
      },
    });

    return updatedTeam; // Return the updated team
  }
}
