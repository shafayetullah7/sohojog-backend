import { InvitationResponseStatus } from 'src/constants/enums/invitation.e';
import { z } from 'zod';

export const invitationResponseParamSchema = z.object({
  id: z.string().uuid('Invalid invitation ID format'),
});
export const invitationResponseBodySchema = z.object({
  status: z.nativeEnum(InvitationResponseStatus, {
    required_error: 'Action is required',
    invalid_type_error: 'Action must be either accept or reject',
  }),
});

// Extract types from schemas
export type InvitationResponseParamDto = z.infer<
  typeof invitationResponseParamSchema
>;
export type InvitationResponseBodyDto = z.infer<
  typeof invitationResponseBodySchema
>;
