import { SubmissionStatus, TaskPriority, TaskStatus } from '@prisma/client';
import { z } from 'zod';

export const queryTaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(255).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  projectId: z.string().uuid().optional(),
  taskAssignmentType: z.enum(['GROUP', 'INDIVIDUAL']).optional(),
  teamId: z.string().uuid().optional(),
  submissionStatus: z.nativeEnum(SubmissionStatus).optional(),

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

  page: z
      .string()
      .transform((pageString) => parseInt(pageString, 10))
      .pipe(z.number().int().positive())
      .default('1'),

    limit: z
      .string()
      .transform((limitString) => parseInt(limitString, 10))
      .pipe(
        z
          .number()
          .int()
          .positive()
          .max(100, 'Limit cannot be more than 100')
      )
      .default('10'),
  assignmentLimit: z
  .string()
  .transform((pageString) => parseInt(pageString, 10))
  .pipe(z.number().int().positive())
  .default('3'),
});

export type QueryTaskDto = z.infer<typeof queryTaskSchema>;
