import { z } from 'zod';

export const CreateUserWithGoogleSchema = z
  .object({
    email: z.string().email(),
    name: z.string(),
    googleId: z.string(),
    // profilePicture: z.string().url().optional(),
    googleEmailVerified: z.boolean(),
    hasPassword: z.boolean().default(false),
    verified: z.boolean().default(true),
  })
  .strict();

export type CreateUserWithGoogleDto = z.infer<
  typeof CreateUserWithGoogleSchema
>;
