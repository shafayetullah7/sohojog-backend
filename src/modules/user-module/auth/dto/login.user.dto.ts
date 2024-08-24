import { z } from 'zod';

// Define the Zod schema
export const loginUserBodySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export type LoginUserBodyDto = z.infer<typeof loginUserBodySchema>;
