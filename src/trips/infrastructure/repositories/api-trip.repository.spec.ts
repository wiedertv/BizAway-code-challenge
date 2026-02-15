import { Test, TestingModule } from '@nestjs/testing';
import { ApiTripRepository } from './api-trip.repository';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { UnprocessableEntityException } from '@nestjs/common';
import { AxiosResponse } from 'axios';

describe('ApiTripRepository', () => {
  let repository: ApiTripRepository;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'TRIPS_API_KEY') return 'test-api-key';
      if (key === 'TRIPS_API_BASE_URL') return 'http://test-api.com';
      return null;
    }),
  };

  const mockTripsResponse: AxiosResponse = {
    data: [
      {
        id: 'trip-1',
        origin: 'SYD',
        destination: 'GRU',
        cost: 1000,
        duration: 10,
        type: 'flight',
        display_name: 'Cheap Flight',
        arrival: '2026-02-15T10:00:00Z',
        departure: '2026-02-15T00:00:00Z',
      },
    ],
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      // @ts-expect-error Mocking headers
      headers: {},
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTripRepository,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    repository = module.get<ApiTripRepository>(ApiTripRepository);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should fetch trips from external API and return mapped entities', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockTripsResponse));

      const result = await repository.findAll({
        origin: 'SYD',
        destination: 'GRU',
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('trip-1');
      expect(result[0].cost).toBe(1000);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(httpService.get as unknown as jest.Mock).toHaveBeenCalledWith(
        'http://test-api.com/trips',
        expect.objectContaining({
          params: { origin: 'SYD', destination: 'GRU' },
          headers: { 'x-api-key': 'test-api-key' },
        }),
      );
    });

    it('should throw UnprocessableEntityException on external API error', async () => {
      const errorResponse = {
        response: {
          data: { message: 'API Error' },
        },
        message: 'Request failed',
      };
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => errorResponse));

      await expect(
        repository.findAll({ origin: 'SYD', destination: 'GRU' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException on unexpected error', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new Error('Unexpected');
      });

      await expect(
        repository.findAll({ origin: 'SYD', destination: 'GRU' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
