import { ApiProperty } from '@nestjs/swagger';

export class SavedTripResponseDto {
  @ApiProperty({
    description: 'MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'Session identifier',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  })
  sessionId!: string;

  @ApiProperty({
    description: 'User ID (optional, for future auth)',
    example: null,
    nullable: true,
  })
  userId!: string | null;

  @ApiProperty({
    description: 'Original trip ID',
    example: 'trip-123',
  })
  tripId!: string;

  @ApiProperty({
    description: 'Origin IATA code',
    example: 'SYD',
  })
  origin!: string;

  @ApiProperty({
    description: 'Destination IATA code',
    example: 'GRU',
  })
  destination!: string;

  @ApiProperty({
    description: 'Cost in USD',
    example: 1000,
  })
  cost!: number;

  @ApiProperty({
    description: 'Duration in hours',
    example: 10,
  })
  duration!: number;

  @ApiProperty({
    description: 'Transport type',
    example: 'flight',
  })
  type!: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Qantas QF101',
  })
  displayName!: string;

  @ApiProperty({
    description: 'Timestamp when trip was saved',
    example: '2026-02-14T18:30:00.000Z',
  })
  savedAt!: string;
}
