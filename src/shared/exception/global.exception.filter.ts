import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ResponseBuilder } from '../utils/response-builder/response.builder';
import { getNewId } from '../utils/uuid/getNewUuid';
import { Request } from 'express';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = 'Internal server error';

    this.logger.error(exception);

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
        name: 'INTERNAL_SERVER_ERROR',
        message,
        issues: [],
        details: exception.stack || '',
        severity: 'error',
        type: 'system',
        timestamp: new Date().toISOString(),
      })
      .build();

    response.status(status).json(errorResponse);
  }
}
