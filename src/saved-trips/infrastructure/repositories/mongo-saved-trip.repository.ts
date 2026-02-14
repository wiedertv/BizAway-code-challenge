import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedTripRepository } from '../../domain/repositories/saved-trip.repository.interface';
import { SavedTrip } from '../../domain/entities/saved-trip.entity';
import { SavedTripDocument } from '../schemas/saved-trip.schema';
import { SavedTripMapper } from '../mappers/saved-trip.mapper';

@Injectable()
export class MongoSavedTripRepository implements SavedTripRepository {
  private readonly logger = new Logger(MongoSavedTripRepository.name);

  constructor(
    @InjectModel(SavedTripDocument.name)
    private readonly model: Model<SavedTripDocument>,
  ) {}

  async save(trip: SavedTrip): Promise<SavedTrip> {
    const doc = new this.model({
      sessionId: trip.sessionId,
      userId: trip.userId,
      tripId: trip.tripId,
      origin: trip.origin,
      destination: trip.destination,
      cost: trip.cost,
      duration: trip.duration,
      type: trip.type,
      displayName: trip.displayName,
      savedAt: trip.savedAt,
    });

    const saved = await doc.save();
    this.logger.log(`Saved trip to MongoDB with _id: ${saved._id.toString()}`);

    return SavedTripMapper.toDomain(saved);
  }

  async findBySessionId(sessionId: string): Promise<SavedTrip[]> {
    const docs = await this.model
      .find({ sessionId })
      .sort({ savedAt: -1 })
      .exec();

    this.logger.log(`Found ${docs.length} trips for session: ${sessionId}`);

    return docs.map((doc) => SavedTripMapper.toDomain(doc));
  }

  async deleteById(id: string, sessionId: string): Promise<void> {
    const result = await this.model.deleteOne({ _id: id, sessionId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Trip with id ${id} not found for this session`,
      );
    }

    this.logger.log(`Deleted trip ${id} from MongoDB`);
  }
}
