import {
  ProjectPriority,
  ProjectStatus,
  ProjectVisibility,
} from '@prisma/client';
import { z } from 'zod';

export const updateProjectBodySchema = z
  .object({
    title: z
      .string({
        required_error: 'Project name is required.',
        invalid_type_error: 'Project name must be string.',
      })
      .min(1, 'Project name cannot be empty.')
      .max(255, 'Project name cannot be larger than 255 characters.')
      .trim(),
    description: z
      .string({ invalid_type_error: 'Description must be string' })
      .max(1000, 'Description is too long.')
      .trim()
      .optional(),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
    startDate: z
      .date({ invalid_type_error: 'Invalid date' })
      .default(new Date()),
    endDate: z.date({ invalid_type_error: 'Invalid date' }).optional(),
    visibility: z
      .nativeEnum(ProjectVisibility)
      .default(ProjectVisibility.PRIVATE),
    priority: z.nativeEnum(ProjectPriority).default(ProjectPriority.MEDIUM),
    addTags: z
      .array(z.string().trim())
      .max(10, 'There can only be 10 or less tags.')
      .refine(
        (arr) =>
          new Set(arr.map((str) => str.toLowerCase())).size === arr.length,
        { message: 'Tags must be unique.' },
      ),
    removeTags: z
      .array(z.string().uuid('Invalid tag id.'))
      .max(10, 'There can only be 10 or less tags.')
      .refine((arr) => new Set(arr).size === arr.length, {
        message: 'Tags must be unique.',
      }),
  })
  .partial();

export const updateProjectParamSchema = z
  .object({
    id: z.string().uuid('Invalid tag id.'),
  })
  .strict();

export type UpdateProjectBodyDto = z.infer<typeof updateProjectBodySchema>;
export type UpdateProjectParamDto = z.infer<typeof updateProjectParamSchema>;
