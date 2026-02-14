import { SavedTrip } from '../../domain/entities/saved-trip.entity';
import { SavedTripDocument } from '../schemas/saved-trip.schema';
import { SavedTripResponseDto } from '../../application/dtos/saved-trip-response.dto';

export class SavedTripMapper {
  static toDomain(doc: SavedTripDocument): SavedTrip {
    return SavedTrip.create(
      doc._id.toString(),
      doc.sessionId,
      doc.userId || null,
      doc.tripId,
      doc.origin,
      doc.destination,
      doc.cost,
      doc.duration,
      doc.type,
      doc.displayName,
      doc.savedAt,
    );
  }

  static toResponse(entity: SavedTrip): SavedTripResponseDto {
    const dto = new SavedTripResponseDto();
    dto.id = entity.id;
    dto.sessionId = entity.sessionId;
    dto.userId = entity.userId;
    dto.tripId = entity.tripId;
    dto.origin = entity.origin;
    dto.destination = entity.destination;
    dto.cost = entity.cost;
    dto.duration = entity.duration;
    dto.type = entity.type;
    dto.displayName = entity.displayName;
    dto.savedAt = entity.savedAt.toISOString();
    return dto;
  }
}
