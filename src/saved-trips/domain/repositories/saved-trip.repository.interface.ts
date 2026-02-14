import { SavedTrip } from '../entities/saved-trip.entity';

export const SAVED_TRIP_REPOSITORY = Symbol('SAVED_TRIP_REPOSITORY');

export interface SavedTripRepository {
  save(trip: SavedTrip): Promise<SavedTrip>;
  findBySessionId(sessionId: string): Promise<SavedTrip[]>;
  deleteById(id: string, sessionId: string): Promise<void>;
}
