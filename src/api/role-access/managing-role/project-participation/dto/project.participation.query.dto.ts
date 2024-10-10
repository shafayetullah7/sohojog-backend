import { ParticipantionStatus } from '@prisma/client';
import { ParticipantRole } from 'src/constants/enums/participant.e';
import { z } from 'zod';

export const projectParticipationQuerySchema = z
  .object({
    id: z.string().uuid('Invalid Id'),
    projectId: z.string().uuid('Invalid Id'),
    userId: z.string().uuid('Invalid Id'),
    status: z.nativeEnum(ParticipantionStatus),
    role: z.nativeEnum(ParticipantRole),
    invitationId: z.string().uuid('Invalid Id'),
    joinedAt: z.string().date(),
    joinedFrom: z.string().date(),
    joinedTo: z.string().date(),
    searchTerm: z.string().trim().max(255),
    page: z
      .number()
      .int()
      .min(1)
      .default(1)
      .transform((data) => Number(data)),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .transform((data) => Number(data)),
  })
  .partial();

export type ProjectParticipationQueryDto = z.infer<
  typeof projectParticipationQuerySchema
>;
