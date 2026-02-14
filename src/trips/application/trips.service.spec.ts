import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { UnprocessableEntityException } from '@nestjs/common';
import { SearchTripDto, SortStrategy } from './dtos/search-trip.dto';
import { Trip } from '../domain/entities/trip.entity';
import { TRIP_REPOSITORY } from '../domain/repositories/trip.repository.interface';

describe('TripsService', () => {
    let service: TripsService;
    let tripRepository: any;

    const mockTrips: Trip[] = [
        Trip.create('1', 'SYD', 'GRU', 1000, 10, 'flight', 'Trip 1'),
        Trip.create('2', 'SYD', 'GRU', 500, 20, 'train', 'Trip 2'),
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TripsService,
                {
                    provide: TRIP_REPOSITORY,
                    useValue: {
                        findAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TripsService>(TripsService);
        tripRepository = module.get(TRIP_REPOSITORY);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('search', () => {
        const searchDto: SearchTripDto = {
            origin: 'SYD',
            destination: 'GRU',
            sort_by: SortStrategy.FASTEST,
        };

        it('should fetch trips and sort by fastest', async () => {
            tripRepository.findAll.mockResolvedValue(mockTrips);

            const result = await service.search(searchDto);

            expect(tripRepository.findAll).toHaveBeenCalledWith({
                origin: 'SYD',
                destination: 'GRU',
            });

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('1');
            expect(result[1].id).toBe('2');
        });

        it('should fetch trips and sort by cheapest', async () => {
            tripRepository.findAll.mockResolvedValue(mockTrips);

            const result = await service.search({ ...searchDto, sort_by: SortStrategy.CHEAPEST });

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('2');
            expect(result[1].id).toBe('1');
        });

        it('should rethrow UnprocessableEntityException from repository', async () => {
            tripRepository.findAll.mockRejectedValue(new UnprocessableEntityException('Repository Error'));

            await expect(service.search(searchDto)).rejects.toThrow(UnprocessableEntityException);
        });

        it('should wrap unknown errors in UnprocessableEntityException', async () => {
            tripRepository.findAll.mockRejectedValue(new Error('Unknown Error'));

            await expect(service.search(searchDto)).rejects.toThrow(UnprocessableEntityException);
        });
    });
});
