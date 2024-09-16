import { z } from 'zod';

export const resetPassBodySchema = z
  .object({
    // otp: z.string().length(6, 'Invalid otp'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(25, 'Password cannot exceed 25 characters'),
  })
  .strict();

export type ResetPassBodyDto = z.infer<typeof resetPassBodySchema>;
export type ResetPassDataDto = ResetPassBodyDto & { userId: string };
