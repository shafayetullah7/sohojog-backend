import { z } from 'zod';

export const deleteFilesSchema = z.object({
  fileIds: z.array(z.string().uuid()).min(1),
});
export type DeleteFilesDto = z.infer<typeof deleteFilesSchema>;
