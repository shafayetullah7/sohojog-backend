import { z } from 'zod';
import { Currency, WalletStatus } from '@prisma/client';

export const createTeamWalletSchema = z.object({
  teamId: z.string().uuid('Invalid team ID'),
  balance: z.number().min(0, 'Balance cannot be negative').default(0),
  currency: z.nativeEnum(Currency).default(Currency.USD),
  status: z.nativeEnum(WalletStatus).default(WalletStatus.ACTIVE),
});

export type CreateTeamWalletDto = z.infer<typeof createTeamWalletSchema>;
