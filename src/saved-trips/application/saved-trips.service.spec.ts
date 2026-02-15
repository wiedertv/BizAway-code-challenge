import { Test, TestingModule } from '@nestjs/testing';
import { SavedTripsService } from './saved-trips.service';
import { SAVED_TRIP_REPOSITORY } from '../domain/repositories/saved-trip.repository.interface';
import { SaveTripDto } from './dtos/save-trip.dto';
import { SavedTrip } from '../domain/entities/saved-trip.entity';

describe('SavedTripsService', () => {
  let service: SavedTripsService;
  let repository: {
    save: jest.Mock;
    findBySessionId: jest.Mock;
    deleteById: jest.Mock;
    generateSessionId: jest.Mock;
  };

  const mockRepository = {
    save: jest.fn(),
    findBySessionId: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockSavedTrip = new SavedTrip(
    'test-id',
    'session-123',
    null,
    'trip-abc',
    'SYD',
    'GRU',
    1000,
    10,
    'flight',
    'Qantas',
    new Date(),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedTripsService,
        {
          provide: SAVED_TRIP_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SavedTripsService>(SavedTripsService);
    repository = module.get(SAVED_TRIP_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveTrip', () => {
    it('should save a trip successfully', async () => {
      const dto: SaveTripDto = {
        tripId: 'trip-abc',
        origin: 'SYD',
        destination: 'GRU',
        cost: 1000,
        duration: 10,
        type: 'flight',
        displayName: 'Qantas',
      };
      const sessionId = 'session-123';

      repository.save.mockResolvedValue(mockSavedTrip);

      const result = await service.saveTrip(dto, sessionId);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSavedTrip);
      expect(result.sessionId).toBe(sessionId);
    });
  });

  describe('findBySessionId', () => {
    it('should return an array of saved trips', async () => {
      const sessionId = 'session-123';
      const trips = [mockSavedTrip];

      repository.findBySessionId.mockResolvedValue(trips);

      const result = await service.findBySessionId(sessionId);

      expect(repository.findBySessionId).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(trips);
    });
  });

  describe('deleteTrip', () => {
    it('should delete a trip successfully', async () => {
      const id = 'test-id';
      const sessionId = 'session-123';

      repository.deleteById.mockResolvedValue(undefined);

      await service.deleteTrip(id, sessionId);

      expect(repository.deleteById).toHaveBeenCalledWith(id, sessionId);
    });
  });

  describe('generateSessionId', () => {
    it('should return a valid uuid', () => {
      const uuid = service.generateSessionId();
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBeGreaterThan(0);
    });
  });
});
