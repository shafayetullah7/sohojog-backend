import { z } from 'zod';

export const createInvitationBodySchema = z.object({
  projectId: z.string().uuid(),
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be string',
    })
    .email('Invalid email'),
  invitedUserName: z
    .string({ invalid_type_error: 'Name must be string' })
    .optional(),
  message: z
    .string({ invalid_type_error: 'Message must be string' })
    .max(1000)
    .optional(),
  sendEmail: z.boolean().default(false),
});

export type CreateInvitationBodyDto = z.infer<
  typeof createInvitationBodySchema
>;
