import { z } from 'zod';

export const getGroupMessageQuerySchema = z.object({
  page: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().min(1).max(100).default(1),
  ),
  limit: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().min(1).max(100).default(10),
  ),
});

export const getGroupMessageParamsSchema = z.object({
  groupId: z.string().uuid(),
});

export type GetGroupMessageQueryDto = z.infer<
  typeof getGroupMessageQuerySchema
>;
export type GetGroupMessageParamsDto = z.infer<
  typeof getGroupMessageParamsSchema
>;
