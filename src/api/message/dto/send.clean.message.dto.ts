import { z } from 'zod';

export const sendCleanMessageSchema = z.object({
  content: z.string().optional(),
  fileIds: z.array(z.string().uuid()).min(1),
  roomId: z.string().uuid(),
});

export type SendCleanMessageDto = z.infer<typeof sendCleanMessageSchema>;
