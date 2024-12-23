import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().optional(),
  roomId: z.string().uuid(),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
