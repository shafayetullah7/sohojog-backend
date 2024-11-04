import { z } from 'zod';

// Define the Zod schema
export const createUserBodySchema = z
  .object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be string',
      })
      .trim()
      .min(1, 'Name is required')
      .max(200, 'Name cannot exceed 200 characters')
      .transform((str) =>
        str
          .split(' ')
          .filter((str) => str.length)
          .join(' '),
      ),

    email: z
      .string()
      .min(1, 'Email is required')
      .max(200, 'Email cannot exceed 200 characters')
      .email('Invalid email address'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(25, 'Password cannot exceed 25 characters'),
  })
  .strict();

// Infer the DTO type
export type CreateUserBodyDto = z.infer<typeof createUserBodySchema>;
