import { UsePipes } from '@nestjs/common';

import { ZodSchema } from 'zod';
import { ZodValidationPipe } from '../custom-pipes/zod.validation.pipe';

// export function ZodValidation(schema: ZodSchema) {
//   return applyDecorators(UsePipes(new ZodValidationPipe(schema)));
// }
// export function ZodBody(schema: ZodSchema<any>) {
//   return applyDecorators(Body(), UsePipes(new ZodValidationPipe(schema)));
// }

// export function ZodParams(schema: ZodSchema<any>) {
//   return applyDecorators(Param(), UsePipes(new ZodValidationPipe(schema)));
// }

// export function ZodQuery(schema: ZodSchema<any>) {
//   return applyDecorators(Query(), UsePipes(new ZodValidationPipe(schema)));
// }

// export const ZodValidation = (...schemas: ZodSchema[]) => {
//   return UsePipes(...schemas.map((schema) => new ZodValidationPipe(schema)));
// };

export const ZodValidation = (schema: ZodSchema) => {
  return new ZodValidationPipe(schema);
};
