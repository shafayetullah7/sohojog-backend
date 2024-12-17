import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().optional(),
  groupId: z.string().uuid().optional(),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
