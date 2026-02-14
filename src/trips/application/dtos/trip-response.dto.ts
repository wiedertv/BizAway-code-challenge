import { ApiProperty } from '@nestjs/swagger';
import { Trip } from '../../domain/entities/trip.entity';

export class TripResponseDto {
  @ApiProperty({ example: 'a749c866-7928-4d08-9d5c-a6821a583d1a' })
  id: string;

  @ApiProperty({ example: 'SYD' })
  origin: string;

  @ApiProperty({ example: 'GRU' })
  destination: string;

  @ApiProperty({ example: 625 })
  cost: number;

  @ApiProperty({ example: 5 })
  duration: number;

  @ApiProperty({ example: 'flight' })
  type: string;

  @ApiProperty({ example: 'from SYD to GRU by flight' })
  display_name: string;

  constructor(trip: Trip) {
    this.id = trip.id;
    this.origin = trip.origin;
    this.destination = trip.destination;
    this.cost = trip.cost;
    this.duration = trip.duration;
    this.type = trip.type;
    this.display_name = trip.displayName;
  }
}
