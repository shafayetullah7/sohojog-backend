import { z } from 'zod';
import dayjs from 'dayjs';
import { Prisma, TeamRole } from '@prisma/client';

// Validation schema using Zod
export const teamMembershipQuerySchema = z
  .object({
    teamId: z.string().uuid('Invalid team ID').optional(),
    participationId: z.string().uuid('Invalid participation ID').optional(),
    projectId: z.string().uuid('Invalid project ID').optional(),
    role: z.nativeEnum(TeamRole).optional(),
    active: z.boolean().optional(),
    joinedFrom: z
      .string()
      .refine((date) => dayjs(date).isValid(), {
        message: 'Invalid date format for "joinedFrom".',
      })
      .optional(),
    joinedTo: z
      .string()
      .refine((date) => dayjs(date).isValid(), {
        message: 'Invalid date format for "joinedTo".',
      })
      .optional(),
    searchTerm: z.string().optional(),
    page: z
      .string()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 1, { message: 'Page number must be at least 1' }),
    limit: z
      .string()
      .default('10')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 1, { message: 'Limit must be at least 1' }),
  })
  .strip();

export type TeamMembershipQueryDto = z.infer<typeof teamMembershipQuerySchema>;
