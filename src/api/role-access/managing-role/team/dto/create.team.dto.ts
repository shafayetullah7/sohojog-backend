import { TeamStatus } from '@prisma/client';
import { uniqueStringsIgnoreCase } from 'src/_helpers/validation-helpers/refines/strings.unique';
import { removeExtraSpaces } from 'src/_helpers/validation-helpers/transforms/string.cleanup';
import { z } from 'zod';

export const createTeamBodySchema = z.object({
  name: z
    .string({
      required_error: 'Team name is required',
      invalid_type_error: 'Team name must be string',
    })
    .trim()
    .min(1, 'Team name is required')
    .max(255, "Team name can't exceed 255 characters")
    .transform(removeExtraSpaces),
  purpose: z
    .string()
    .max(1000, "Purpose can't exceed 1000 characters")
    .nullable()
    .optional(),
  projectId: z.string().uuid('Invalid project ID format'),
  status: z.nativeEnum(TeamStatus).optional(),
  responsibilities: z
    .array(
      z
        .string()
        .trim()
        .max(50, 'Text is too long.')
        .transform(removeExtraSpaces),
    )
    .max(10, 'Too many responsibilities.')
    .refine(uniqueStringsIgnoreCase, {
      message: 'Responsibilities must be unique.',
    })
    .default([]),
});

export type CreateTeamBodyDto = z.infer<typeof createTeamBodySchema>;
