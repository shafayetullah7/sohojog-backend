import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseBuilder } from '../utils/response-builder/response.builder';
import { getNewId } from '../utils/uuid/getNewUuid';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const message = exception.message;

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
        name: exception.name,
        message,
        issues: [],
        details: exception.stack || '',
        severity: 'error',
        type: 'http',
        timestamp: new Date().toISOString(),
      })
      .build();

    response.status(status).json(errorResponse);
  }
}
