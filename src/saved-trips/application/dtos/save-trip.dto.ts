import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveTripDto {
  @ApiProperty({
    description: 'Original trip ID from search results',
    example: 'trip-123',
  })
  @IsNotEmpty()
  @IsString()
  tripId!: string;

  @ApiProperty({
    description: 'Origin IATA code',
    example: 'SYD',
  })
  @IsNotEmpty()
  @IsString()
  origin!: string;

  @ApiProperty({
    description: 'Destination IATA code',
    example: 'GRU',
  })
  @IsNotEmpty()
  @IsString()
  destination!: string;

  @ApiProperty({
    description: 'Trip cost in USD',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  cost!: number;

  @ApiProperty({
    description: 'Trip duration in hours',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  duration!: number;

  @ApiProperty({
    description: 'Type of transport',
    example: 'flight',
  })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiProperty({
    description: 'Display name for the trip',
    example: 'Qantas QF101',
  })
  @IsNotEmpty()
  @IsString()
  displayName!: string;
}
