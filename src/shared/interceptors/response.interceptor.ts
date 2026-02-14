import { Request } from 'express';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ClsService } from 'nestjs-cls';
import { StandardResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  private readonly logger = new Logger(ResponseInterceptor.name);

  constructor(private readonly cls: ClsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const path = request.url;

    // Skip interceptor for health check endpoints - they have their own format
    if (path.startsWith('/health')) {
      return next.handle() as unknown as Observable<StandardResponse<T>>;
    }

    const now = Date.now();
    const traceId = this.cls.get<string>('traceId');

    return next.handle().pipe(
      map((data: T) => ({
        statusCode: context.switchToHttp().getResponse<{ statusCode: number }>()
          .statusCode,
        message: 'Operation successful',
        data: data,
        meta: {
          traceId: traceId ?? 'no-trace',
          timestamp: new Date().toISOString(),
        },
      })),
      tap((response) => {
        const duration = Date.now() - now;
        this.logger.log(
          `[${traceId}] Outgoing Response: ${response.statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
