import { z } from 'zod';

import { TeamRole } from '@prisma/client';

export const addRoleToMemberSchema = z.object({
  membershipId: z.string().uuid('Invalid membership ID format'),
  role: z.nativeEnum(TeamRole, {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid role type',
  }),
});

// Export type for use in your service or controller
export type AddRoleToMemberDto = z.infer<typeof addRoleToMemberSchema>;
