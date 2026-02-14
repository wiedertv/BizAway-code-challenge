import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { TripsModule } from './trips/trips.module';
import { SavedTripsModule } from './saved-trips/saved-trips.module';
import { HealthModule } from './health/health.module';
import { ClsModule } from 'nestjs-cls';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
import { TraceMiddleware } from './shared/middlewares/trace.middleware';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true }, // Automatically mounts ClsMiddleware
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('RATE_LIMIT_TTL', 60) * 1000, // Convert to milliseconds
          limit: configService.get<number>('RATE_LIMIT_MAX', 100),
        },
      ],
    }),
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate, // Add environment variable validation
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const useInMemoryDb = configService.get<boolean>('USE_IN_MEMORY_DB');
        if (useInMemoryDb) {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create();
          const uri = mongod.getUri();
          return {
            uri,
          };
        }
        const uri = configService.get<string>('MONGODB_URI');
        return { uri };
      },
    }),
    TripsModule,
    SavedTripsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
