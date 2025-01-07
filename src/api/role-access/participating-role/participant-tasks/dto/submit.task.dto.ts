import { z } from 'zod';

export const assignmentSubmissionSchema = z.object({
  taskId: z.string().uuid(),
  description: z
    .string()
    .min(1, { message: 'Description is required.' })
    .max(5000, {
      message: 'Description must not exceed 5000 characters.',
    }),
});

export type AssignmentSubmissionDto = z.infer<typeof assignmentSubmissionSchema>