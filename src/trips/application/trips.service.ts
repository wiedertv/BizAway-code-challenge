import {
  Injectable,
  Inject,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SearchTripDto, SortStrategy } from './dtos/search-trip.dto';
import { Trip } from '../domain/entities/trip.entity';
import { FastestTripStrategy } from '../domain/strategies/fastest-trip.strategy';
import { CheapestTripStrategy } from '../domain/strategies/cheapest-trip.strategy';
import {
  TRIP_REPOSITORY,
  type TripRepository,
} from '../domain/repositories/trip.repository.interface';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    @Inject(TRIP_REPOSITORY)
    private readonly tripRepository: TripRepository,
  ) {}

  async search(searchTripDto: SearchTripDto): Promise<Trip[]> {
    const { origin, destination, sort_by } = searchTripDto;

    try {
      let trips = await this.tripRepository.findAll({ origin, destination });

      // Apply Sort Strategy
      if (sort_by === SortStrategy.FASTEST) {
        trips = new FastestTripStrategy().sort(trips);
      } else if (sort_by === SortStrategy.CHEAPEST) {
        trips = new CheapestTripStrategy().sort(trips);
      }

      return trips;
    } catch (error) {
      // If the repository throws a known exception, rethrow it
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      // Otherwise log and throw a generic error (though repository should handle most)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Unexpected search error: ${errorMessage}`, errorStack);
      throw new UnprocessableEntityException(
        'An unexpected error occurred while searching for trips',
      );
    }
  }
}
