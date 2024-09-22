import { TeamStatus } from '@prisma/client';
import { z } from 'zod';

export const getMyProjectTeamsQuerySchema = z
  .object({
    name: z.string().trim().optional(),
    // .min(1, 'Search term must be at least 1 character long'),
    status: z.nativeEnum(TeamStatus).optional(),
    purpose: z
      .string()
      .trim()
      .min(1, 'Purpose search term must be at least 1 character long')
      .optional(),
    projectId: z.string().uuid('Invalid project ID').optional(),
    page: z.number().int().min(1, 'Page number must be at least 1').default(1),
    limit: z
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  })
  .strict();
export type GetMyProjectTeamsQueryDto = z.infer<typeof getMyProjectTeamsQuerySchema>;
