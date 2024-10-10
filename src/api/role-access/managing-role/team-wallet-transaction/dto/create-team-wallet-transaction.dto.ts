import dayjs from 'dayjs';
import { z } from 'zod';

export const createTeamWalletTransactionDtoSchema = z.object({
  teamWalletId: z.string().uuid('Invalid Team Wallet ID'), // Ensure it's a valid UUID
  transactionDate: z
    .string()
    .datetime()
    .refine((date) => !dayjs(date).isAfter(dayjs()), {
      message: 'Transaction date cannot be in the future',
    }),
  amount: z.number().positive('Amount must be a positive number'),
  description: z
    .string()
    .max(255, 'Description cannot exceed 255 characters')
    .optional(),
});

export type CreateTeamWalletTransactionDto = z.infer<
  typeof createTeamWalletTransactionDtoSchema
>;
