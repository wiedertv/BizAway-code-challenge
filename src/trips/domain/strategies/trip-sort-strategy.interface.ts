import { Trip } from '../entities/trip.entity';

export interface TripSortStrategy {
    sort(trips: Trip[]): Trip[];
}
