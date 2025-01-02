import { z } from 'zod';

export const getSingleTaskParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetSingleTaskParamsDto = z.infer<
  typeof getSingleTaskParamsSchema
>;
