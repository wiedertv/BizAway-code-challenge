import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { SearchTripDto, SortStrategy } from './dtos/search-trip.dto';
import { Trip } from '../domain/entities/trip.entity';
import { TripResponseDto } from './dtos/trip-response.dto';

describe('TripsController', () => {
  let controller: TripsController;
  let service: TripsService;

  const mockTrip = Trip.create('1', 'SYD', 'GRU', 1000, 10, 'flight', 'Trip 1');

  const mockTripsService = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        {
          provide: TripsService,
          useValue: mockTripsService,
        },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
    service = module.get<TripsService>(TripsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    const searchDto: SearchTripDto = {
      origin: 'SYD',
      destination: 'GRU',
      sort_by: SortStrategy.FASTEST,
    };

    it('should return an array of TripResponseDto', async () => {
      mockTripsService.search.mockResolvedValue([mockTrip]);
      const searchSpy = jest.spyOn(service, 'search');

      const result = await controller.search(searchDto);

      expect(searchSpy).toHaveBeenCalledWith(searchDto);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(TripResponseDto);
      expect(result[0]?.id).toBe(mockTrip.id);
      expect(result[0]?.origin).toBe(mockTrip.origin);
    });
  });
});
