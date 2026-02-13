import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchTripDto } from './dtos/search-trip.dto';
import { Trip } from '../domain/entities/trip.entity';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
    @Get('search')
    @ApiOperation({ summary: 'Search for trips from origin to destination' })
    @ApiResponse({
        status: 200,
        description: 'Returns a list of trips sorted by the specified strategy.',
        type: [Trip],
    })
    async search(@Query() searchTripDto: SearchTripDto): Promise<Trip[]> {
        return [];
    }
}
