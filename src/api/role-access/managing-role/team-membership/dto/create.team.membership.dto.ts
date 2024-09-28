import { TeamRole } from '@prisma/client';
import { z } from 'zod';

export const createTeamMembershipSchema = z.object({
  participationId: z.string().uuid(),
  teamId: z.string().uuid(),
//   role: z.nativeEnum(TeamRole).optional().default('MEMBER'), // Optional, defaults to MEMBER
  purpose: z.string().nullable().optional(), // Optional nullable text field
  responsibilities: z.array(z.string()), // Array of strings for responsibilities
  joinedAt: z.date().optional().default(() => new Date()), // Defaults to current date
});
