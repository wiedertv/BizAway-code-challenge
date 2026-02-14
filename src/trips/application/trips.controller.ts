import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchTripDto } from './dtos/search-trip.dto';
import { TripsService } from './trips.service';

import { TripMapper } from '../infrastructure/mappers/trip.mapper';
import { TripResponseDto } from './dtos/trip-response.dto';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for trips from origin to destination' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of trips sorted by the specified strategy.',
    type: [TripResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error - Failed to fetch trips from external API',
  })
  async search(
    @Query() searchTripDto: SearchTripDto,
  ): Promise<TripResponseDto[]> {
    const trips = await this.tripsService.search(searchTripDto);
    return trips.map(TripMapper.toResponse);
  }
}
