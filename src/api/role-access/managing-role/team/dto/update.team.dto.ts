import { TeamStatus } from '@prisma/client';
import { z } from 'zod';

export const updateTeamParamSchema = z.object({
  id: z.string().uuid('Invalid team ID'),
});

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
    responsibilities: z
      .array(z.string().trim())
      .max(10, 'There can only be 10 or less responsibilities.')
      .refine(
        (arr) =>
          new Set(arr.map((str) => str.toLowerCase())).size === arr.length,
        { message: 'Responsibilities must be unique.' },
      ),
  })
  .partial();

export type UpdateTeamBodyDto = z.infer<typeof updateTeamBodySchema>;
export type UpdateTeamParamDto = z.infer<typeof updateTeamParamSchema>;
