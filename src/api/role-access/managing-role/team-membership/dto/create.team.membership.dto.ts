import { uniqueStringsIgnoreCase } from 'src/_helpers/validation-helpers/refines/strings.unique';
import { removeExtraSpaces } from 'src/_helpers/validation-helpers/transforms/string.cleanup';
import { z } from 'zod';

export const createTeamMembershipSchema = z.object({
  participationId: z.string().uuid('Invalid participation ID format'),
  purpose: z
    .string()
    .max(1000, 'Purpose should not exceed 1000 characters')
    .optional(),
  responsibilities: z
    .array(
      z
        .string()
        .trim()
        .max(50, 'Text is too long.')
        .transform(removeExtraSpaces),
    )
    .max(10, 'Too many responsibilities.')
    .refine(uniqueStringsIgnoreCase, {
      message: 'Responsibilities must be unique.',
    })
    .default([]),
});

// Infer the DTO type from the Zod schema
export type CreateTeamMembershipDto = z.infer<
  typeof createTeamMembershipSchema
>;
