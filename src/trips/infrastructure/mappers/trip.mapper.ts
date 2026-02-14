import { TripsApiResponse } from '../interfaces/trips-api-response.interface';
import { Trip } from '../../domain/entities/trip.entity';

import { TripResponseDto } from '../../application/dtos/trip-response.dto';

export class TripMapper {
  static toDomain(raw: TripsApiResponse): Trip {
    return Trip.create(
      raw.id,
      raw.origin,
      raw.destination,
      raw.cost,
      raw.duration,
      raw.type,
      raw.display_name,
    );
  }

  static toResponse(trip: Trip): TripResponseDto {
    return new TripResponseDto(trip);
  }
}
