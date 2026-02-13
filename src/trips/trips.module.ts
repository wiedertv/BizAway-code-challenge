import { Module } from '@nestjs/common';
import { TripsController } from './application/trips.controller';

@Module({
    controllers: [TripsController],
})
export class TripsModule { }
