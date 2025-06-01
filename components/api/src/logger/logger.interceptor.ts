/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectPinoLogger(LoggingInterceptor.name)
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const body = request.body || {};
    const params = request.params || {};
    const query = request.query || {};
    const userAgent = request.headers['user-agent'] || '';
    const ip = this.getClientIp(request);
    const requestId = request.id || 'unknown';
    const startTime = Date.now();

    // this.logger.debug({ message: url });
    // this.logger.debug({
    //   type: 'request',
    //   requestId,
    //   method,
    //   url,
    //   userAgent,
    //   ip,
    //   body,
    //   params,
    //   query,
    //   message: `Incoming request ${method} ${url}`,
    // });

    return next.handle().pipe(
      tap({
        next: (val: unknown) => {
          const responseTime = Date.now() - startTime;
          this.logger.debug({
            type: 'response',
            requestId,
            method,
            url,
            responseTime,
            message: `Response sent ${method} ${url} - ${responseTime}ms`,
          });
          return val;
        },
        error: (err: Error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error({
            type: 'error',
            requestId,
            method,
            url,
            error: {
              message: err.message,
              name: err.name,
              stack: err.stack,
            },
            responseTime,
            message: `Error in ${method} ${url} - ${responseTime}ms: ${err.message}`,
          });
        },
      }),
    );
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    const forwardedIp =
      typeof forwarded === 'string' ? forwarded.split(',')[0] : undefined;
    return forwardedIp || request.socket?.remoteAddress || 'unknown';
  }
}
