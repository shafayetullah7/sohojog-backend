import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { Request, Response } from 'express';
import { ResponseBuilder } from '../modules/response-builder/response.builder';
import { TerrorIssue } from '../modules/response-builder/response.interface';
import { getNewId } from '../utils/uuid/getNewUuid';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.BAD_REQUEST;
    const message = 'Validation failed';

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
        name: 'VALIDATION_ERROR',
        message,
        issues: this.formatZodIssues(exception),
        details: exception.stack || '',
        severity: 'error',
        type: 'validation',
        timestamp: new Date().toISOString(),
      })
      .build();

    response.status(status).json(errorResponse);
  }

  private formatZodIssues(exception: ZodError): TerrorIssue[] {
    return exception.issues.map((issue) => {
      const field =
        issue.path.length > 0 ? issue.path[issue.path.length - 1] : undefined;

      return {
        field: typeof field === 'string' ? field : undefined,
        message: issue.message,
      };
    });
  }
}
