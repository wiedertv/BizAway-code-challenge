import { Trip } from '../entities/trip.entity';
import { TripSortStrategy } from './trip-sort-strategy.interface';

export class FastestTripStrategy implements TripSortStrategy {
    sort(trips: Trip[]): Trip[] {
        return trips.sort((a, b) => a.duration - b.duration);
    }
}
