import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsIataCode } from '../../../shared/validators/is-iata-code.decorator';

export enum SortStrategy {
  FASTEST = 'fastest',
  CHEAPEST = 'cheapest',
}

export class SearchTripDto {
  @ApiProperty({ description: 'Origin IATA code', example: 'SYD' })
  @IsNotEmpty()
  @IsString()
  @IsIataCode()
  origin!: string;

  @ApiProperty({ description: 'Destination IATA code', example: 'JFK' })
  @IsNotEmpty()
  @IsString()
  @IsIataCode()
  destination!: string;

  @ApiProperty({
    description: 'Sorting strategy',
    enum: SortStrategy,
    example: SortStrategy.FASTEST,
  })
  @IsNotEmpty()
  @IsEnum(SortStrategy)
  sort_by!: SortStrategy;
}
