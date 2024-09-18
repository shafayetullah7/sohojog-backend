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
      .trim()
      .min(1, 'Project name cannot be empty.')
      .max(255, 'Project name cannot be larger than 255 characters.'),
    description: z
      .string({ invalid_type_error: 'Description must be string' })
      .trim()
      .max(1000, 'Description is too long.'),
    status: z.nativeEnum(ProjectStatus),
    startDate: z.string().datetime('Invalid date'),
    endDate: z.string().datetime('Invalid date'),
    visibility: z.nativeEnum(ProjectVisibility),
    priority: z.nativeEnum(ProjectPriority),
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
  .strict()
  .partial();

export const updateProjectParamSchema = z
  .object({
    id: z.string().uuid('Invalid tag id.'),
  })
  .strict();

export type UpdateProjectBodyDto = z.infer<typeof updateProjectBodySchema>;
export type UpdateProjectParamDto = z.infer<typeof updateProjectParamSchema>;
