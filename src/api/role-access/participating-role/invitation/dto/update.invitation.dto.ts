import { z } from 'zod';

export const updateParticipantInvitationBody = z.object({
  seen: z.boolean({ required_error: 'The "seen" value is required' }),
});

export const updateParticipantInvitationParams = z.object({
  id: z.string().uuid(),
});

export type UpdateParticipantInvitationBodyDto = z.infer<
  typeof updateParticipantInvitationBody
>;

export type UpdateParticipantInvitationParamsDto = z.infer<
  typeof updateParticipantInvitationParams
>;
