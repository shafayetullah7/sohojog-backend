import { z } from 'zod';

export const getSingleInvitationParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetSingleInvitationParamsDto = z.infer<
  typeof getSingleInvitationParamsSchema
>;
