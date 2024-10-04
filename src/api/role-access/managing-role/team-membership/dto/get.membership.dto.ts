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
  .strict();

export type TeamMembershipQueryDto = z.infer<typeof teamMembershipQuerySchema>;
