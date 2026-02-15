import { Test, TestingModule } from '@nestjs/testing';
import { SavedTripsController } from './saved-trips.controller';
import { SavedTripsService } from './saved-trips.service';
import { SavedTrip } from '../domain/entities/saved-trip.entity';
import { SaveTripDto } from './dtos/save-trip.dto';
import { SavedTripResponseDto } from './dtos/saved-trip-response.dto';
describe('SavedTripsController', () => {
  let controller: SavedTripsController;

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

  const mockService = {
    generateSessionId: jest.fn(),
    saveTrip: jest.fn(),
    findBySessionId: jest.fn(),
    deleteTrip: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedTripsController],
      providers: [
        {
          provide: SavedTripsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SavedTripsController>(SavedTripsController);
    service = module.get<SavedTripsService>(SavedTripsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('saveTrip', () => {
    it('should save a trip generating a sessionId if not provided', async () => {
      const dto: SaveTripDto = {
        tripId: 'trip-abc',
        origin: 'SYD',
        destination: 'GRU',
        cost: 1000,
        duration: 10,
        type: 'flight',
        displayName: 'Qantas',
      };
      const generatedSessionId = 'session-456';

      mockService.generateSessionId.mockReturnValue(generatedSessionId);
      mockService.saveTrip.mockResolvedValue({
        ...mockSavedTrip,
        sessionId: generatedSessionId,
      });

      const result = await controller.saveTrip(undefined, dto);

      expect(mockService.generateSessionId).toHaveBeenCalled();
      expect(mockService.saveTrip).toHaveBeenCalledWith(
        dto,
        generatedSessionId,
      );
      expect(result).toBeInstanceOf(SavedTripResponseDto);
      expect(result.sessionId).toBe(generatedSessionId);
    });

    it('should save a trip using provided sessionId', async () => {
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

      mockService.saveTrip.mockResolvedValue(mockSavedTrip);

      const result = await controller.saveTrip(sessionId, dto);

      expect(mockService.generateSessionId).not.toHaveBeenCalled();
      expect(mockService.saveTrip).toHaveBeenCalledWith(dto, sessionId);
      expect(result).toBeInstanceOf(SavedTripResponseDto);
      expect(result.sessionId).toBe(sessionId);
    });
  });

  describe('getAllSavedTrips', () => {
    it('should return all trips for a session', async () => {
      const sessionId = 'session-123';
      const trips = [mockSavedTrip];

      mockService.findBySessionId.mockResolvedValue(trips);

      const result = await controller.getAllSavedTrips(sessionId);

      expect(mockService.findBySessionId).toHaveBeenCalledWith(sessionId);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SavedTripResponseDto);
      expect(result[0].id).toBe(mockSavedTrip.id);
    });

    it('should throw error if sessionId is missing', async () => {
      await expect(controller.getAllSavedTrips('')).rejects.toThrow(
        'Session ID is required',
      );
    });
  });

  describe('deleteTrip', () => {
    it('should delete a trip', async () => {
      const sessionId = 'session-123';
      const id = 'test-id';

      mockService.deleteTrip.mockResolvedValue(undefined);

      await controller.deleteTrip(sessionId, id);

      expect(mockService.deleteTrip).toHaveBeenCalledWith(id, sessionId);
    });

    it('should throw error if sessionId is missing', async () => {
      await expect(controller.deleteTrip('', 'test-id')).rejects.toThrow(
        'Session ID is required',
      );
    });
  });
});
