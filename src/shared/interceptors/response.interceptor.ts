import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ClsService } from 'nestjs-cls';
import { StandardResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
    private readonly logger = new Logger(ResponseInterceptor.name);

    constructor(private readonly cls: ClsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
        const now = Date.now();
        const traceId = this.cls.get('traceId');

        return next.handle().pipe(
            map((data) => ({
                statusCode: context.switchToHttp().getResponse().statusCode,
                message: 'Operation successful',
                data: data,
                meta: {
                    traceId: traceId,
                    timestamp: new Date().toISOString(),
                },
            })),
            tap((response) => {
                const duration = Date.now() - now;
                this.logger.log(`[${traceId}] Outgoing Response: ${response.statusCode} - ${duration}ms`);
            }),
        );
    }
}
