import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, LoggerService } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  const configService = app.get(ConfigService);

  // Security: Helmet middleware for secure HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"], // Allow Swagger UI to make API calls
        },
      },
      crossOriginEmbedderPolicy: false, // Needed for Swagger UI
    }),
  );

  // CORS configuration
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '*');
  app.enableCors({
    origin: corsOrigins === '*' ? '*' : corsOrigins.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true,
    maxAge: 3600,
  });

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Trip Planner API')
    .setDescription('BizAway Tech Challenge - Trip Search and Management API')
    .setVersion('1.0')
    .addTag('trips', 'trip search operations')
    .addTag('saved-trips', 'saved trip management operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);

  if (configService.get('USE_IN_MEMORY_DB')) {
    logger.log?.('Running with IN-MEMORY Database (MongoDB Memory Server)');
  }

  logger.log?.(`Application is running on: http://localhost:${port}`);
  logger.log?.(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}
void bootstrap();
