import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseFormat } from '../utils/response-builder/response.interface';
import { ResponseBuilder } from '../utils/response-builder/response.builder';
import {} from 'express';
import { getNewId } from '../utils/uuid/getNewUuid';
import { Request, Response } from 'express';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data) => {
        const req = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();

        const responseBuilder = new ResponseBuilder<T>()
          .setSuccess(true)
          .setMessage('')
          .setData(data)
          .setRequestDetails(req.url, req.method) // Set URL and method
          .setMeta({
            timestamp: new Date().toISOString(),
            request_id: getNewId(),
            response_code: res.statusCode,
            response_time: Number(req.startTime)
              ? Date.now() - Number(req.startTime)
              : -1,
            rate_limit_remaining: 10,
            rate_limit_reset: Date.now() + 3600 * 1000,
          });

        if (data instanceof ResponseBuilder) {
          if (data.refreshToken) {
            res.cookie('sohojogRefreshToken', data.refreshToken, {
              maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
              httpOnly: true,
              secure: true,
              sameSite: 'none',
            });
          }
          return data
            .setRequestDetails(req.url, req.method)
            .setMeta({
              ...data.getMeta,
              request_id: getNewId(),
              response_code: res.statusCode,
              response_time: Number(req.startTime)
                ? Date.now() - Number(req.startTime)
                : -1,
            })
            .build();
        } else {
          return responseBuilder.build();
        }
      }),
    );
  }
}
