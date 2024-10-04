import { WalletStatus } from '@prisma/client';
import { z } from 'zod';

export const updateWalletStatusBodySchema = z.object({
  status: z.nativeEnum(WalletStatus),
});

export const updateWalletStatusParamSchema = z.object({
  walletId: z.string().uuid('Invalid wallet ID'),
});

export type UpdateWalletStatusBodyDto = z.infer<
  typeof updateWalletStatusBodySchema
>;

export type UpdateWalletStatusParamDto = z.infer<
  typeof updateWalletStatusParamSchema
>;
