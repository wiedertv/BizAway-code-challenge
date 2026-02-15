import { Test, TestingModule } from '@nestjs/testing';
import { MongoSavedTripRepository } from './mongo-saved-trip.repository';
import { getModelToken } from '@nestjs/mongoose';
import { SavedTripDocument } from '../schemas/saved-trip.schema';
import { SavedTrip } from '../../domain/entities/saved-trip.entity';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('MongoSavedTripRepository', () => {
  let repository: MongoSavedTripRepository;
  let model: {
    find: jest.Mock;
    deleteOne: jest.Mock;
    new: jest.Mock;
    constructor: jest.Mock;
  };

  const mockSavedTripDoc = {
    _id: new Types.ObjectId(),
    sessionId: 'session-123',
    userId: 'user-123',
    tripId: 'trip-1',
    origin: 'SYD',
    destination: 'GRU',
    cost: 1000,
    duration: 10,
    type: 'flight',
    displayName: 'Cheap Flight',
    savedAt: new Date(),
    save: jest.fn(),
  };

  const mockModel = {
    new: jest.fn().mockImplementation(
      (dto: any) =>
        ({
          ...dto,
          save: jest.fn().mockResolvedValue({ ...mockSavedTripDoc, ...dto }),
        }) as unknown as SavedTripDocument,
    ),
    constructor: jest.fn().mockImplementation(
      (dto: any) =>
        ({
          ...dto,
          save: jest.fn().mockResolvedValue({ ...mockSavedTripDoc, ...dto }),
        }) as unknown as SavedTripDocument,
    ),
    find: jest.fn(),
    deleteOne: jest.fn(),
  };

  // Mock the constructor behavior for model
  const mockModelConstructor = jest.fn().mockImplementation(
    (dto: any) =>
      ({
        ...dto,
        save: jest.fn().mockResolvedValue({ ...mockSavedTripDoc, ...dto }),
      }) as unknown as SavedTripDocument,
  );
  Object.assign(mockModelConstructor, mockModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoSavedTripRepository,
        {
          provide: getModelToken(SavedTripDocument.name),
          useValue: mockModelConstructor,
        },
      ],
    }).compile();

    repository = module.get<MongoSavedTripRepository>(MongoSavedTripRepository);
    model = module.get(getModelToken(SavedTripDocument.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('save', () => {
    it('should save a trip', async () => {
      const trip = SavedTrip.create(
        'id-1',
        'session-123',
        'user-123',
        'trip-1',
        'SYD',
        'GRU',
        1000,
        10,
        'flight',
        'Cheap Flight',
        new Date(),
      );

      const result = await repository.save(trip);

      expect(result).toBeDefined();
      expect(result.tripId).toBe('trip-1');
      expect(mockModelConstructor).toHaveBeenCalled();
    });
  });

  describe('findBySessionId', () => {
    it('should find trips by session id', async () => {
      const mockDocs = [mockSavedTripDoc];
      const mockExec = jest.fn().mockResolvedValue(mockDocs);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      model.find.mockReturnValue({ sort: mockSort });

      const result = await repository.findBySessionId('session-123');

      expect(result).toHaveLength(1);
      expect(model.find).toHaveBeenCalledWith({ sessionId: 'session-123' });
    });
  });

  describe('deleteById', () => {
    it('should delete a trip', async () => {
      const mockExec = jest.fn().mockResolvedValue({ deletedCount: 1 });
      model.deleteOne.mockReturnValue({ exec: mockExec });

      await repository.deleteById('some-id', 'session-123');

      expect(model.deleteOne).toHaveBeenCalledWith({
        _id: 'some-id',
        sessionId: 'session-123',
      });
    });

    it('should throw NotFoundException if trip not found', async () => {
      const mockExec = jest.fn().mockResolvedValue({ deletedCount: 0 });
      model.deleteOne.mockReturnValue({ exec: mockExec });

      await expect(
        repository.deleteById('some-id', 'session-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
