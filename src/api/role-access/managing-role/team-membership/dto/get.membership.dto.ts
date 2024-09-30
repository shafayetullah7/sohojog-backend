import { z } from 'zod';
import dayjs from 'dayjs';
import { Prisma, TeamRole } from '@prisma/client';

// Validation schema using Zod
export const teamMembershipQuerySchema = z
  .object({
    teamId: z.string().uuid('Invalid team ID'),
    participationId: z.string().uuid('Invalid participation ID'),
    projectId: z.string().uuid('Invalid project ID'),
    role: z.nativeEnum(TeamRole),
    active: z.boolean(),
    joinedFrom: z.string().refine((date) => dayjs(date).isValid(), {
      message: 'Invalid date format for "joinedFrom".',
    }),
    joinedTo: z.string().refine((date) => dayjs(date).isValid(), {
      message: 'Invalid date format for "joinedTo".',
    }),
  })
  .partial()
  .strict()
  .transform((data) => {
    const whereClause: Prisma.TeamMembershipWhereInput = {};

    if (data.teamId) {
      whereClause.teamId = data.teamId;
    }

    if (data.participationId) {
      whereClause.participationId = data.participationId;
    }

    if (data.projectId) {
      whereClause.participation = { projectId: data.projectId };
    }

    if (data.role) {
      whereClause.TeamMemberRole = {
        some: {
          role: data.role,
        },
      };
    }

    if (typeof data.active === 'boolean') {
      whereClause.TeamMemberRole = {
        some: {
          active: data.active,
        },
      };
    }

    if (data.joinedFrom || data.joinedTo) {
      whereClause.joinedAt = {};
      if (data.joinedFrom) {
        whereClause.joinedAt.gte = dayjs(data.joinedFrom).toDate();
        if (data.joinedTo) {
          whereClause.joinedAt.lte = dayjs(data.joinedTo).toDate();
        }
      }

      return {
        where: whereClause,
      };
    }
  });

export type TeamMembershipQueryDto = z.infer<typeof teamMembershipQuerySchema>;
