import { z } from 'zod';
import dayjs from 'dayjs';

export const createProjectWalletTransactionSchema = z.object({
  walletId: z.string().uuid('Invalid wallet ID'),
  amount: z.number().min(0.01, 'Transaction amount must be greater than zero'),
  transactionDate: z
    .string()
    .datetime()
    .refine((date) => dayjs(date).isBefore(dayjs()), {
      message: 'Transaction date must be before the current moment.',
    }),
  description: z.string().optional(),
});

export type CreateProjectWalletTransactionDto = z.infer<
  typeof createProjectWalletTransactionSchema
>;
