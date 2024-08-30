import { z } from 'zod';

export const verifyOtpBodySchema = z.object({
  otp: z.string().length(6, 'Invalid otp'),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(200, 'Email cannot exceed 200 characters')
    .email('Invalid email address'),
});

export type VerifyOtpBodyDto = z.infer<typeof verifyOtpBodySchema>;
