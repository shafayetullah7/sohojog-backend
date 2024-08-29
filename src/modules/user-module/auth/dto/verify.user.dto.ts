import { z } from 'zod';

export const verifyUserBodySchema = z.object({
  otp: z.string().length(6, 'Invalid otp'),
});

export type VerifynUserBodyDto = z.infer<typeof verifyUserBodySchema>;
