import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly cls: ClsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = this.cls.get<string>('traceId');

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    // Extract error details if "message" is an object (common with class-validator/NestJS exceptions)
    const errorDetails = typeof message === 'object' ? message : { message };

    // Log unexpected errors
    if (status >= 500) {
      this.logger.error(
        `[${traceId ?? 'no-trace'}] Critical Error: ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `[${traceId ?? 'no-trace'}] Exception: ${JSON.stringify(errorDetails)}`,
      );
    }

    const messageText =
      typeof message === 'string'
        ? message
        : typeof message === 'object' &&
            message !== null &&
            'message' in message
          ? String((message as { message?: unknown }).message)
          : 'Error occurred';

    response.status(status).json({
      statusCode: status,
      message: messageText,
      error: errorDetails,
      meta: {
        traceId: traceId,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
