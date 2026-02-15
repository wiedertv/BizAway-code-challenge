import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { TripsController } from './application/trips.controller';
import { TripsService } from './application/trips.service';
import { ApiTripRepository } from './infrastructure/repositories/api-trip.repository';
import { TRIP_REPOSITORY } from './domain/repositories/trip.repository.interface';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 60 * 1000, // 1 minute cache
      max: 100, // Max 100 items in cache
    }),
  ],
  controllers: [TripsController],
  providers: [
    TripsService,
    ApiTripRepository,
    {
      provide: TRIP_REPOSITORY,
      useClass: ApiTripRepository,
    },
  ],
})
export class TripsModule {}
