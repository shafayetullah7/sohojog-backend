import {
  Prisma,
  ProjectPriority,
  ProjectStatus,
  ProjectVisibility,
} from '@prisma/client';
import { z } from 'zod';

export const getMyProjectsQuerySchema = z
  .object({
    id: z.string().uuid(),
    searchTerm: z.string().max(255, 'search key is too long.'),
    status: z.nativeEnum(ProjectStatus),
    priority: z.nativeEnum(ProjectPriority),
    visibility: z.nativeEnum(ProjectVisibility),
    tag: z.string(),
  })
  .partial()
  .transform((data) => {
    const { searchTerm, ...rest } = data;

    // Initialize where clause
    const whereClause: Prisma.ProjectWhereInput = { ...rest };

    // Handle partial match for searchTerm
    if (searchTerm) {
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { hasSome: [searchTerm] } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    if (data.tag) {
      whereClause.tags = { has: data.tag };
    }

    return whereClause;
  });

export type GetMyProjectsQueryDto = z.infer<typeof getMyProjectsQuerySchema>;
