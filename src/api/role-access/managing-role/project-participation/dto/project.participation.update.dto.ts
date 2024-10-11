import { ParticipationStatus } from '@prisma/client';
import { z } from 'zod';

export const projectParticipationUpdatePayloadSchema = z
  .object({
    status: z.nativeEnum(ParticipationStatus),
  })
  .partial();

export const projectParticipationUpdateParamSchema = z.object({
  participationId: z.string().uuid(),
});

export type ProjectParticipationUpdateDto = z.infer<
  typeof projectParticipationUpdatePayloadSchema
>;

export type ProjectParticipationUpdateParamDto = z.infer<
  typeof projectParticipationUpdateParamSchema
>;
