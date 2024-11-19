import { z } from 'zod';
import { InviteStatus } from '@prisma/client';
import dayjs from 'dayjs';

export const getInvitationsQuerySchema = z
  .object({
    projectId: z.string().uuid('Invalid project ID format').optional(),
    status: z.nativeEnum(InviteStatus).optional(),
    invitedBy: z.string().uuid('Invalid user ID format').optional(),

    date: z
      .string()
      .date()
      .transform((dateString) => dayjs(dateString).toDate())
      .optional(),

    month: z
      .number()
      .int()
      .min(1)
      .max(12)
      .transform((month) => ({
        startOfMonth: dayjs()
          .month(month - 1)
          .startOf('month')
          .toDate(),
        endOfMonth: dayjs()
          .month(month - 1)
          .endOf('month')
          .toDate(),
      }))
      .optional(),

    year: z
      .number()
      .int()
      .transform((year) => ({
        startOfYear: dayjs().year(year).startOf('year').toDate(),
        endOfYear: dayjs().year(year).endOf('year').toDate(),
      }))
      .optional(),

    beforeDate: z
      .string()
      .date()
      .transform((dateString) => dayjs(dateString).toDate())
      .optional(),

    afterDate: z
      .string()
      .date()
      .transform((dateString) => dayjs(dateString).toDate())
      .optional(),

    page: z.number().int().positive().default(1),
    limit: z
      .number()
      .int()
      .positive()
      .max(100, 'Limit cannot be more than 100')
      .default(10),

    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),

    searchTerm: z.string().trim().max(255).optional(),
  })
  .strict();

export type GetInvitationsQueryDto = z.infer<typeof getInvitationsQuerySchema>;
