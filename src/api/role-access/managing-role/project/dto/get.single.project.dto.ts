import { z } from 'zod';

export const getSingleProjectSchema = z.object({
  id: z.string().uuid(),
});

export type GetSingleProjectDto = z.infer<typeof getSingleProjectSchema>;
