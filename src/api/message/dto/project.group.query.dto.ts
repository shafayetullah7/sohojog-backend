import { z } from 'zod';

const GroupRoleEnum = z.enum(['MEMBER', 'ADMIN']);
const TeamStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const projectGroupQuerySchema = z.object({
  groupType: z.enum(['PROJECT', 'TEAM']).optional(),
  groupRole: GroupRoleEnum.optional(),
  status: TeamStatusEnum.optional(),
  includeInactive: z.boolean().optional().default(false),
  page: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().min(1).max(100).default(1),
  ),
  limit: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().min(1).max(100).default(10),
  ),
});

export type ProjectGroupQueryDto = z.infer<typeof projectGroupQuerySchema>;
