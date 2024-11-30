import { ParticipationRole, ParticipationStatus } from '@prisma/client';
import { z } from 'zod';

export const projectParticipationQuerySchema = z
  .object({
    id: z.string().uuid('Invalid Id').optional(),
    projectId: z.string().uuid('Invalid Id').optional(),
    userId: z.string().uuid('Invalid Id').optional(),
    status: z.nativeEnum(ParticipationStatus).optional(),
    role: z.nativeEnum(ParticipationRole).optional(),
    invitationId: z.string().uuid('Invalid Id').optional(),
    joinedAt: z
      .string()
      .datetime({ message: 'Invalid DateTime format' })
      .optional(),
    joinedFrom: z
      .string()
      .datetime({ message: 'Invalid DateTime format' })
      .optional(),
    joinedTo: z
      .string()
      .datetime({ message: 'Invalid DateTime format' })
      .optional(),
    searchTerm: z
      .string()
      .trim()
      .max(255, 'Search term is too long')
      .optional(),
    page: z
      .union([
        z.string().regex(/^\d+$/, 'Page must be a number').transform(Number), // Convert strings to numbers
        z.number().int().min(1),
      ])
      .default(1), // Defaults to 1 if not provided
    limit: z
      .union([
        z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number), // Convert strings to numbers
        z.number().int().min(1).max(100),
      ])
      .default(10), // Defaults to 10 if not provided
  })
  .partial(); // All fields are optional by default

export type ProjectParticipationQueryDto = z.infer<
  typeof projectParticipationQuerySchema
>;
