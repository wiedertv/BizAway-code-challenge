import { Trip } from '../entities/trip.entity';
import { TripSortStrategy } from './trip-sort-strategy.interface';

export class CheapestTripStrategy implements TripSortStrategy {
    sort(trips: Trip[]): Trip[] {
        return trips.sort((a, b) => a.cost - b.cost);
    }
}
