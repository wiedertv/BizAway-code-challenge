import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { SavedTripsService } from './saved-trips.service';
import { SaveTripDto } from './dtos/save-trip.dto';
import { SavedTripResponseDto } from './dtos/saved-trip-response.dto';
import { SavedTripMapper } from '../infrastructure/mappers/saved-trip.mapper';

@ApiTags('Saved Trips')
@Controller('saved-trips')
export class SavedTripsController {
  constructor(private readonly savedTripsService: SavedTripsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Save a trip',
    description:
      'Save a trip to your collection. If x-session-id header is not provided, a new session will be created.',
  })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Session identifier (auto-generated if not provided)',
    required: false,
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: 201,
    description: 'Trip saved successfully',
    type: SavedTripResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async saveTrip(
    @Headers('x-session-id') sessionId: string | undefined,
    @Body() dto: SaveTripDto,
  ): Promise<SavedTripResponseDto> {
    const finalSessionId =
      sessionId || this.savedTripsService.generateSessionId();

    const savedTrip = await this.savedTripsService.saveTrip(
      dto,
      finalSessionId,
    );

    return SavedTripMapper.toResponse(savedTrip);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all saved trips',
    description: 'Retrieve all trips saved for the current session',
  })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Session identifier',
    required: true,
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: 200,
    description: 'List of saved trips',
    type: [SavedTripResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Missing session ID',
  })
  async getAllSavedTrips(
    @Headers('x-session-id') sessionId: string,
  ): Promise<SavedTripResponseDto[]> {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    const trips = await this.savedTripsService.findBySessionId(sessionId);
    return trips.map((trip) => SavedTripMapper.toResponse(trip));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a saved trip',
    description: 'Remove a trip from your saved collection',
  })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Session identifier',
    required: true,
    schema: { type: 'string' },
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the saved trip',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Trip deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trip not found',
  })
  async deleteTrip(
    @Headers('x-session-id') sessionId: string,
    @Param('id') id: string,
  ): Promise<void> {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    await this.savedTripsService.deleteTrip(id, sessionId);
  }
}
