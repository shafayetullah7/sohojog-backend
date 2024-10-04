import { Currency, WalletStatus } from '@prisma/client';
import { nativeEnum, z } from 'zod';

export const createProjectWalletSchema = z.object({
  balance: z.number().min(0, 'Balance cannot be negative').default(0),
  currency: z.nativeEnum(Currency),
  status: nativeEnum(WalletStatus).default(WalletStatus.ACTIVE),
  projectId: z.string().uuid('Invalid Project ID'),
});

export type CreateProjectWalletDto = z.infer<typeof createProjectWalletSchema>;
