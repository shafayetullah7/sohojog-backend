import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { CreateProjectBodyDto } from './dto/create.project.dto';
import { GetMyProjectsQueryDto } from './dto/get.my.projets.dto';
import { UpdateProjectBodyDto } from './dto/update.project.dto';
import { managerProjectHelper } from 'src/_helpers/access-helpers/manager-access/manager.project.helper';
import { title } from 'process';
import { ProjectStats } from './type/project.summary.type';

@Injectable()
export class ProjectService {
  constructor(
    private readonly response: ResponseBuilder<any>,
    private readonly prisma: PrismaService,
  ) {}

  async createProject(userId: string, payload: CreateProjectBodyDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      // Check if a project with the same title exists for this creator
      const existingProject = await tx.project.findUnique({
        where: { creatorId_title: { creatorId: userId, title: payload.title } },
      });

      // console.log('********', userId);

      // Throw an error if a project with the same title exists
      if (existingProject) {
        throw new ConflictException(
          'Already created a project with similar title',
        );
      }

      // Create the new project with an array of tags
      const newProject = await tx.project.create({
        data: {
          ...payload,
          creatorId: userId,
          participations: {
            create: {
              userId,
              joinedAt: new Date(),
              adminRole: {
                create: {},
              },
            },
          },
        },
        include: {
          participations: true, // Include participations if needed
        },
      });

      const newGroup = await tx.group.create({
        data: {
          name: payload.title,
          createdBy: userId,
          ProjectGroup: {
            create: {
              projectId: newProject.id,
            },
          },
        },
      });

      // Add the creator as a participant in the project
      // const participant = await tx.participation.create({
      //   data: {
      //     projectId: newProject.id,
      //     userId,
      //   },
      // });

      // // Assign the creator as the manager of the project
      // const manager = await tx.projectAdmin.create({
      //   data: {
      //     participationId: participant.id,
      //     role: ProjectAdminRole.MANAGER,
      //   },
      // });

      // Logging the new project for debugging
      // console.log(newProject);

      // Set the response object with success status and project data

      return newProject;
    });
    return this.response
      .setSuccess(true)
      .setMessage('New project created.')
      .setData({ project: result });
  }

  async getMyProjects(userId: string, query: GetMyProjectsQueryDto) {
    // Fetch projects and tasks counts in a single query using a raw query
    const projectsWithTaskCounts = await this.prisma.project.findMany({
      where: { ...query, creatorId: userId },
      include: {
        _count: {
          select: {
            participations: true,
            stakeholders: true,
            invitations: true,
            teams: true,
          },
        },
        participations: {
          take: 4,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: {
                  select: {
                    minUrl: true,
                    midUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get task counts grouped by project in a single query
    const taskCounts = await this.prisma.task.groupBy({
      by: ['projectId', 'status'],
      _count: {
        status: true,
      },
      where: {
        projectId: {
          in: projectsWithTaskCounts.map((project) => project.id), // Filter tasks for fetched projects
        },
      },
    });

    // Prepare a map for easy access to task counts by projectId
    const taskCountsMap = taskCounts.reduce(
      (acc, { projectId, status, _count }) => {
        acc[projectId] = acc[projectId] || { total: 0, todo: 0, done: 0 };
        acc[projectId].total += _count.status;
        if (status === 'TODO') {
          acc[projectId].todo = _count.status;
        } else if (status === 'DONE') {
          acc[projectId].done = _count.status;
        }
        return acc;
      },
      {},
    );

    // Enrich projects with task counts
    const enrichedProjects = projectsWithTaskCounts.map((project) => {
      const taskCount = taskCountsMap[project.id] || {
        total: 0,
        todo: 0,
        done: 0,
      };
      return {
        ...project,
        description: project.description?.length
          ? project.description.length > 150
            ? `${project.description.substring(0, 150)}...`
            : project.description
          : project.description,
        taskCounts: taskCount,
      };
    });

    return this.response
      .setSuccess(true)
      .setMessage('Projects retrieved.')
      .setData({ projects: enrichedProjects });
  }

  async updateProject(
    userId: string,
    projectId: string,
    payload: UpdateProjectBodyDto,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId, creatorId: userId },
      });

      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      const result = await tx.project.update({
        where: { id: projectId },
        data: {
          ...payload,
        },
      });

      return result;
    });
    // console.log(result);

    return this.response
      .setSuccess(true)
      .setMessage('Project updated')
      .setData(result);
  }

  async getSingleProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        participations: {
          some: {
            userId: userId,
            adminRole: { some: { active: true } },
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: {
              select: { minUrl: true, midUrl: true, fullUrl: true },
            },
          },
        },
        wallet: {
          select: {
            currency: true,
            estimatedBudget: true,
            balance: true,
            _count: {
              select: {
                transactions: true,
              },
            },
          },
        },
        _count: {
          select: {
            participations: true,
            teams: true,
            tasks: true,
            invitations: true,
            stakeholders: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error(
        'Project not found or you do not have permission to access it',
      );
    }

    const formattedResponse = {
      id: project.id,
      title: project.title,
      description: project.description,
      tags: project.tags,
      startDate: project.startDate,
      endDate: project.endDate,
      visibility: project.visibility,
      priority: project.priority,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      creator: project.creator,
      counts: project._count,
      wallet: project.wallet,
    };

    return this.response
      .setSuccess(true)
      .setMessage('Project details retrieved.')
      .setData({ project: formattedResponse });
  }

  // Fetches project teams with team details
  async getProjectTeams(userId: string, projectId: string) {
    const teams = await this.prisma.team.findMany({
      where: {
        projectId,
        project: {
          participations: {
            some: {
              userId,
              adminRole: {
                some: {
                  active: true,
                },
              },
            },
          },
        },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            memberShips: true,
            teamTaskAssignments: true,
          },
        },
      },
    });

    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      counts: {
        members: team._count.memberShips,
        taskAssignments: team._count.teamTaskAssignments,
      },
    }));

    return this.response
      .setSuccess(true)
      .setMessage('Project teams retrieved.')
      .setData({ teams: formattedTeams });
  }

  // Fetches participations in the project
  async getProjectParticipants(userId: string, projectId: string) {
    const participations = await this.prisma.participation.findMany({
      where: {
        projectId,
        project: {
          participations: {
            some: {
              userId,
              adminRole: {
                some: {
                  active: true,
                },
              },
            },
          },
        },
      },
      take: 20,
      select: {
        id: true,
        joinedAt: true,
        designation: true,
        user: {
          select: {
            name: true,
            profilePicture: {
              select: { minUrl: true },
            },
          },
        },
      },
    });

    const formattedParticipations = participations.map((participation) => ({
      id: participation.id,
      joinedAt: participation.joinedAt,
      designation: participation.designation,
      user: participation.user,
    }));

    return this.response
      .setSuccess(true)
      .setMessage('Project participations retrieved.')
      .setData({ participants: formattedParticipations });
  }

  async getProjectSummary(userId: string, projectId: string) {
    const rawStats = await this.prisma.$queryRaw<
      Array<{
        pendingCount: number;
        acceptedCount: number;
        declinedCount: number;
        canceledCount: number;
        totalInvitations: number;
        totalTasks: number;
        todoTasks: number;
        inProgressTasks: number;
        doneTasks: number;
        haltedTasks: number;
        archivedTasks: number;
        totalParticipations: number;
        activeParticipations: number;
        inactiveParticipations: number;
        totalStakeholders: number;
        estimatedBudget: number;
        balance: number;
        totalTransactions: number;
        totalCredits: number;
        totalDebits: number;
        creditTransactions: number;
        debitTransactions: number;
        totalTeams: number;
        activeTeams: number;
        inactiveTeams: number;
      }>
    >`
  SELECT
    -- Invitation counts
    COUNT(i.id) FILTER (WHERE i.status = 'PENDING') AS "pendingCount",
    COUNT(i.id) FILTER (WHERE i.status = 'ACCEPTED') AS "acceptedCount",
    COUNT(i.id) FILTER (WHERE i.status = 'DECLINED') AS "declinedCount",
    COUNT(i.id) FILTER (WHERE i.status = 'CANCELED') AS "canceledCount",
    COUNT(i.id) AS "totalInvitations",

    -- Task counts
    COUNT(t.id) AS "totalTasks",
    COUNT(t.id) FILTER (WHERE t.status = 'TODO') AS "todoTasks",
    COUNT(t.id) FILTER (WHERE t.status = 'IN_PROGRESS') AS "inProgressTasks",
    COUNT(t.id) FILTER (WHERE t.status = 'DONE') AS "doneTasks",
    COUNT(t.id) FILTER (WHERE t.status = 'HALTED') AS "haltedTasks",
    COUNT(t.id) FILTER (WHERE t.status = 'ARCHIVED') AS "archivedTasks",

    -- Participation counts
    COUNT(pa.id) AS "totalParticipations",
    COUNT(pa.id) FILTER (WHERE pa.status = 'ACTIVE') AS "activeParticipations",
    COUNT(pa.id) FILTER (WHERE pa.status = 'INACTIVE') AS "inactiveParticipations",

    -- Stakeholder count
    COUNT(ps.id) AS "totalStakeholders",

    -- Wallet and transaction data
    w."estimatedBudget" AS "estimatedBudget",
    w."balance" AS "balance",
    COUNT(wt.id) AS "totalTransactions",
    SUM(CASE WHEN wt."transactionType" = 'CREDIT' THEN wt."amount" ELSE 0 END) AS "totalCredits",
    SUM(CASE WHEN wt."transactionType" = 'DEBIT' THEN wt."amount" ELSE 0 END) AS "totalDebits",
    COUNT(CASE WHEN wt."transactionType" = 'CREDIT' THEN 1 END) AS "creditTransactions",
    COUNT(CASE WHEN wt."transactionType" = 'DEBIT' THEN 1 END) AS "debitTransactions",

    -- Team counts
    COUNT(tm.id) AS "totalTeams",
    COUNT(tm.id) FILTER (WHERE tm.status = 'ACTIVE') AS "activeTeams",
    COUNT(tm.id) FILTER (WHERE tm.status = 'INACTIVE') AS "inactiveTeams"

  FROM
    projects p
  LEFT JOIN
    invitations i ON i."projectId" = p.id 
  LEFT JOIN
    tasks t ON t."projectId" = p.id
  LEFT JOIN
    participations pa ON pa."projectId" = p.id
  LEFT JOIN
    project_stakeholders ps ON ps."projectId" = p.id
  LEFT JOIN
    teams tm ON tm."projectId" = p.id
  LEFT JOIN
    wallets w ON w."projectId" = p.id
  LEFT JOIN
    wallet_transactions wt ON wt."walletId" = w.id
  LEFT JOIN project_admins pad ON pad."participationId" = pa.id
  WHERE
    p.id = ${projectId} and pa."userId" = ${userId}
  GROUP BY
    p.id, w.id;
`;

    // Handle the results
    const stats = rawStats[0] || {};

    // Build the summary object
    const summary = {
      invitations: {
        pendingCount: Number(stats.pendingCount) || 0,
        acceptedCount: Number(stats.acceptedCount) || 0,
        declinedCount: Number(stats.declinedCount) || 0,
        canceledCount: Number(stats.canceledCount) || 0,
        totalInvitations: Number(stats.totalInvitations) || 0,
      },
      tasks: {
        totalTasks: Number(stats.totalTasks) || 0,
        todoTasks: Number(stats.todoTasks) || 0,
        inProgressTasks: Number(stats.inProgressTasks) || 0,
        doneTasks: Number(stats.doneTasks) || 0,
        haltedTasks: Number(stats.haltedTasks) || 0,
        archivedTasks: Number(stats.archivedTasks) || 0,
      },
      participations: {
        totalParticipations: Number(stats.totalParticipations) || 0,
        activeParticipations: Number(stats.activeParticipations) || 0,
        inactiveParticipations: Number(stats.inactiveParticipations) || 0,
      },
      stakeholders: {
        totalStakeholders: Number(stats.totalStakeholders) || 0,
      },
      wallet: {
        estimatedBudget: Number(stats.estimatedBudget) || 0,
        balance: Number(stats.balance) || 0,
        transactions: {
          totalTransactions: Number(stats.totalTransactions) || 0,
          totalCredits: Number(stats.totalCredits) || 0,
          totalDebits: Number(stats.totalDebits) || 0,
          creditTransactions: Number(stats.creditTransactions) || 0,
          debitTransactions: Number(stats.debitTransactions) || 0,
        },
      },
      teams: {
        totalTeams: Number(stats.totalTeams) || 0,
        activeTeams: Number(stats.activeTeams) || 0,
        inactiveTeams: Number(stats.inactiveTeams) || 0,
      },
    };

    // console.log(rawStats);

    // Return the response
    return this.response
      .setSuccess(true)
      .setMessage('Project summary retrieved.')
      .setData({ summary });
  }

  async getTasksGroupedByStatusWithStats(limit = 5, projectId: string) {
    const rawStats = await this.prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        description: string;
        status: string;
        priority: string;
        dueDate: Date | null;
        inableBudget: boolean;
        budget: number;
        projectId: string;
        createdBy: string;
        taskAssignmentType: string;
        createdAt: Date;
        updatedAt: Date;
        totalCount: number; // Make sure to use "totalCount" here
        lastAction: Date | null;
      }>
    >`
      WITH RankedTasks AS (
        SELECT 
          "id", "title", "description", "status", "priority", "dueDate", "inableBudget", "budget",
          "projectId", "createdBy", "taskAssignmentType", "createdAt", "updatedAt",
          ROW_NUMBER() OVER (PARTITION BY "status" ORDER BY "createdAt" DESC) AS row_num
        FROM "tasks"
        WHERE "projectId" = ${projectId}
      ),
      Stats AS (
        SELECT 
          "status",
          COUNT(*) AS "totalCount",  // Change this to "totalCount"
          MAX("updatedAt") AS "lastAction"
        FROM "tasks"
        WHERE "projectId" = ${projectId}
        GROUP BY "status"
      )
      SELECT 
        rt.*, 
        s."totalCount",  // Ensure it's referred to as "totalCount"
        s."lastAction"
      FROM RankedTasks rt
      JOIN Stats s ON rt."status" = s."status"
      WHERE rt.row_num <= ${limit}
      ORDER BY rt."status", rt.createdAt DESC;
    `;

    const groupedTasks = rawStats.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = {
            tasks: [],
            totalCount: task.totalCount, // Use "totalCount"
            lastAction: task.lastAction,
          };
        }
        acc[task.status].tasks.push(task);
        return acc;
      },
      {} as Record<
        string,
        { tasks: typeof rawStats; totalCount: number; lastAction: Date | null }
      >,
    );

    return this.response
      .setSuccess(true)
      .setMessage('Tasks grouped by status with stats retrieved.')
      .setData(groupedTasks);
  }
}
