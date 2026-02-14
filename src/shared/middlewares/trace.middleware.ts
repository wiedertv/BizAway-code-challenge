import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TraceMiddleware.name);

    constructor(private readonly cls: ClsService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const traceId = req.headers['x-request-id'] || uuidv4();
        this.cls.set('traceId', traceId);
        // Also attach traceId to the response header
        res.setHeader('x-request-id', traceId as string);

        this.logger.log(`[${traceId}] Incoming Request: ${req.method} ${req.originalUrl}`);

        next();
    }
}
