import { z } from 'zod';

export const getSingleProjectSchema = z.object({
  projectId: z.string().uuid(),
});
export type GetSingleProjectDto = z.infer<typeof getSingleProjectSchema>;
