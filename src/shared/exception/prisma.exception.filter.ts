import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
// import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ResponseBuilder } from '../shared-modules/response-builder/response.builder';
import { getNewId } from '../utils/uuid/getNewUuid';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.BAD_REQUEST;
    const message = this.handlePrismaError(exception);

    const errorResponse = new ResponseBuilder<null>()
      .setSuccess(false)
      .setMessage(message)
      .setMeta({
        timestamp: new Date().toISOString(),
        request_id: getNewId(),
        response_code: status,
        response_time: Number(request.startTime)
          ? Date.now() - Number(request.startTime)
          : -1,
        rate_limit_remaining: 10,
        rate_limit_reset: Date.now() + 3600 * 1000,
        method: request.method,
        url: request.url,
      })
      .addError({
        code: status,
        name: 'PRISMA_ERROR',
        message,
        issues: [],
        details: exception.stack || '',
        severity: 'error',
        type: 'prisma',
        timestamp: new Date().toISOString(),
      })
      .build();

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
  ): string {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return 'Unique constraint violation';
        case 'P2025':
          return 'Record not found';
        default:
          return exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      return 'Validation error';
    }
    return 'Prisma error';
  }
}
