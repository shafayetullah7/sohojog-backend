import {
    Prisma,
  ProjectPriority,
  ProjectStatus,
  ProjectVisibility,
} from '@prisma/client';
import { z } from 'zod';

export const getProjectsQuerySchema = z
  .object({
    id: z.string().uuid(),
    searchTerm: z.string().max(255, 'search key is too long.'),
    status: z.nativeEnum(ProjectStatus),
    priority: z.nativeEnum(ProjectPriority),
    visibility: z.nativeEnum(ProjectVisibility),
    tagId: z.string().uuid(),
  })
  .partial()
  .transform((data) => {
    const { searchTerm, tagId, ...rest } = data;

    // Initialize where clause
    const whereClause: Prisma.ProjectWhereInput = { ...rest };

    // Handle partial match for searchTerm
    if (searchTerm) {
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Handle tagId for relational filtering
    if (tagId) {
      whereClause.tags = {
        some: {
          id: tagId,
        },
      };
    }

    return whereClause;
  });

export type GetProjectsQueryDto = z.infer<typeof getProjectsQuerySchema>;
