import { WalletStatus } from '@prisma/client';
import { z } from 'zod';

export const updateProjectWalletBodySchema = z.object({
  status: z.nativeEnum(WalletStatus),
});

export const updateProjectWalletParamSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

export type UpdateProjectWalletBodyDto = z.infer<
  typeof updateProjectWalletBodySchema
>;

export type UpdateProjectWalletParamDto = z.infer<
  typeof updateProjectWalletParamSchema
>;
