import { TeamStatus } from '@prisma/client';
import { z } from 'zod';

export const updateTeamBodySchema = z
  .object({
    name: z
      .string()
      .min(1, 'Team name is required')
      .max(255, "Team name can't exceed 255 characters"),
    purpose: z
      .string()
      .max(5000, "Purpose can't exceed 5000 characters")
      .nullable(),
    status: z.nativeEnum(TeamStatus),
  })
  .partial();

export type UpdateTeamBodyDto = z.infer<typeof updateTeamBodySchema>;
