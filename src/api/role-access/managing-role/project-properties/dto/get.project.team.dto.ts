import { z } from 'zod';

export const getProjectTeamSchema = z.object({
  projectId: z.string().uuid(),
  teamId: z.string().uuid(),
});

export type GetProjectTeamDto = z.infer<typeof getProjectTeamSchema>;
