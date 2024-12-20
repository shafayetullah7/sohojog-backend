import { z } from 'zod';

export const getMessageRoomsQuerySchema = z.object({
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
  roomId: z.string().uuid(),
});

export type GetMessageRoomsQueryDto = z.infer<
  typeof getMessageRoomsQuerySchema
>;
export type GetGroupMessageParamsDto = z.infer<
  typeof getGroupMessageParamsSchema
>;
