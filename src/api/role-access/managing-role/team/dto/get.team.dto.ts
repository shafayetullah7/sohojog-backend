// import { TeamStatus } from '@prisma/client';
// import { z } from 'zod';

// export const getMyProjectTeamsQuerySchema = z
//   .object({
//     name: z.string().trim().optional(),
//     // .min(1, 'Search term must be at least 1 character long'),
//     status: z.nativeEnum(TeamStatus).optional(),
//     purpose: z
//       .string()
//       .trim()
//       .min(1, 'Purpose search term must be at least 1 character long')
//       .optional(),
//     projectId: z.string().uuid('Invalid project ID').optional(),
//     page: z.number().int().min(1, 'Page number must be at least 1').default(1),
//     limit: z
//       .number()
//       .int()
//       .min(1, 'Limit must be at least 1')
//       .max(100, 'Limit cannot exceed 100')
//       .default(10),
//     sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
//     sortOrder: z.enum(['asc', 'desc']).default('asc'),
//   })
//   .strict();
// export type GetMyProjectTeamsQueryDto = z.infer<typeof getMyProjectTeamsQuerySchema>;

import { Prisma, TeamStatus } from '@prisma/client';
import { z } from 'zod';

export const getMyProjectTeamsQuerySchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().optional(),
    status: z.nativeEnum(TeamStatus).optional(),
    searchTerm: z
      .string()
      .max(255, 'Search term cannot exceed 255 characters.')
      .optional(),
    projectId: z.string().uuid('Invalid project ID').optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, {
        message: 'Page must be a positive integer',
      })
      .optional()
      .default('1'),

    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
        message: 'Limit must be a positive integer between 1 and 100',
      })
      .optional()
      .default('10'),
    sortBy: z
      .string()
      .refine((val) => ['name', 'createdAt', 'updatedAt'].includes(val), {
        message: 'Invalid sortBy value',
      })
      .default('createdAt') as z.ZodType<'name' | 'createdAt' | 'updatedAt'>,
    sortOrder: z
      .string()
      .refine((val) => ['asc', 'desc'].includes(val), {
        message: 'Invalid sortOrder value',
      })
      .default('desc') as z.ZodType<'asc' | 'desc'>,
  })
  .strip();

export type GetMyProjectTeamsQueryDto = z.infer<
  typeof getMyProjectTeamsQuerySchema
>;
