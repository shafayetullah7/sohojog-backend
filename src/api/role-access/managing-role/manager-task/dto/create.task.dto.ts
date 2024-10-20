import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().max(255, 'Title must be 255 characters or less'),
  description: z.string().max(1300, 'Description is too long.').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  dueDate: z.string().date().optional(),
  inableBudget: z.boolean().optional().default(false),
  budget: z.number().min(0).optional().default(0),
  projectId: z.string().uuid(),
  taskAssignmentType: z.enum(['GROUP', 'INDIVIDUAL']),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
