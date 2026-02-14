import { Injectable, Inject, Logger } from '@nestjs/common';
import { SAVED_TRIP_REPOSITORY } from '../domain/repositories/saved-trip.repository.interface';
import type { SavedTripRepository } from '../domain/repositories/saved-trip.repository.interface';
import { SavedTrip } from '../domain/entities/saved-trip.entity';
import type { SaveTripDto } from './dtos/save-trip.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SavedTripsService {
  private readonly logger = new Logger(SavedTripsService.name);

  constructor(
    @Inject(SAVED_TRIP_REPOSITORY)
    private readonly repository: SavedTripRepository,
  ) {}

  async saveTrip(dto: SaveTripDto, sessionId: string): Promise<SavedTrip> {
    this.logger.log(`Saving trip for session: ${sessionId}`);

    const savedTrip = SavedTrip.create(
      '', // MongoDB will generate _id
      sessionId,
      null, // userId for future auth
      dto.tripId,
      dto.origin,
      dto.destination,
      dto.cost,
      dto.duration,
      dto.type,
      dto.displayName,
      new Date(),
    );

    const result = await this.repository.save(savedTrip);
    this.logger.log(`Trip saved successfully with id: ${result.id}`);

    return result;
  }

  async findBySessionId(sessionId: string): Promise<SavedTrip[]> {
    this.logger.log(`Fetching trips for session: ${sessionId}`);
    return this.repository.findBySessionId(sessionId);
  }

  async deleteTrip(id: string, sessionId: string): Promise<void> {
    this.logger.log(`Deleting trip ${id} for session: ${sessionId}`);

    await this.repository.deleteById(id, sessionId);

    this.logger.log(`Trip ${id} deleted successfully`);
  }

  generateSessionId(): string {
    return uuidv4();
  }
}
