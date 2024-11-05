// user-update.dto.ts
import { z } from 'zod';

export const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Name cannot be empty').max(50, 'Name is too long'), // Adjust max length as needed
  })
  .strict()
  .partial();

// Infer the TypeScript type from the Zod schema
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
