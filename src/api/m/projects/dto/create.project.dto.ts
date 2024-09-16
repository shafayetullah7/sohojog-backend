import {
  ProjectPriority,
  ProjectStatus,
  ProjectVisibility,
} from '@prisma/client';
import {} from // ProjectPriority,
// ProjectStatus,
// ProjectVisibility,
'src/constants/enums/project.e';
import { z } from 'zod';

export const createProjectBodySchema = z
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
      .max(1000, 'Description is too long.')
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
    tags: z
      .array(z.string().trim().max(50, 'Tag is too long.'))
      .max(10, 'Too many tags.')
      .refine(
        (arr) =>
          new Set(arr.map((str) => str.toLowerCase())).size === arr.length,
        { message: 'Tags must be unique.' },
      ),
  })
  .strict();

export type CreateProjectBodyDto = z.infer<typeof createProjectBodySchema>;
