import { TeamRole } from '@prisma/client';
import { z } from 'zod';

const assignTeamRoleSchema = z.object({
  membershipId: z.string().uuid('Invalid Id.'),
  role: z.nativeEnum(TeamRole),
  active: z.boolean().default(true),
});

export type AssignTeamRoleDto = z.infer<typeof assignTeamRoleSchema>;
