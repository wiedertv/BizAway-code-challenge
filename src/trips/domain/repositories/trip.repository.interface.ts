import { Trip } from '../entities/trip.entity';

export interface SearchTripCriteria {
  origin: string;
  destination: string;
}

export interface TripRepository {
  findAll(criteria: SearchTripCriteria): Promise<Trip[]>;
}

export const TRIP_REPOSITORY = 'TRIP_REPOSITORY';
