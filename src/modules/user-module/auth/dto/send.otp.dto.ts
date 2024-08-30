import { z } from 'zod';

export const sendOtpBodySchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(200, 'Email cannot exceed 200 characters')
    .email('Invalid email address'),
});

export type SendOtpBodyDto = z.infer<typeof sendOtpBodySchema>;
