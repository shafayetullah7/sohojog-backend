import { TaskPriority, TaskStatus } from '@prisma/client';
import { z } from 'zod';

export const queryTaskSchema = z.object({
  // Optional filters
  id: z.string().uuid(),
  title: z.string().max(255).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  projectId: z.string().uuid().optional(),
  taskAssignmentType: z.enum(['GROUP', 'INDIVIDUAL']).optional(),

  // Date range filters (optional)
  dueDateFrom: z.string().date().optional(),
  dueDateTo: z.string().date().optional(),
  dueDate: z.string().date().optional(),
  // month: z
  //   .preprocess((data) => Number(data), z.number().min(0).max(11))
  //   .optional(),
  // year: z
  //   .preprocess((data) => Number(data), z.number().min(2000).max(3000))
  //   .optional(),

  // Sorting (optional)
  sortBy: z
    .enum(['title', 'status', 'priority', 'dueDate', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),

  // Pagination (optional)
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess(
    (val) => Number(val),
    z.number().min(1).max(100).default(10),
  ),
  assignmentLimit: z.preprocess(
    (val) => Number(val),
    z.number().min(0).optional().default(3),
  ),
});

export type QueryTaskDto = z.infer<typeof queryTaskSchema>;
