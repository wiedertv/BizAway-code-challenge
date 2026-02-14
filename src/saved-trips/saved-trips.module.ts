import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedTripsController } from './application/saved-trips.controller';
import { SavedTripsService } from './application/saved-trips.service';
import {
  SavedTripDocument,
  SavedTripSchema,
} from './infrastructure/schemas/saved-trip.schema';
import { MongoSavedTripRepository } from './infrastructure/repositories/mongo-saved-trip.repository';
import { SAVED_TRIP_REPOSITORY } from './domain/repositories/saved-trip.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedTripDocument.name, schema: SavedTripSchema },
    ]),
  ],
  controllers: [SavedTripsController],
  providers: [
    SavedTripsService,
    {
      provide: SAVED_TRIP_REPOSITORY,
      useClass: MongoSavedTripRepository,
    },
  ],
})
export class SavedTripsModule {}
