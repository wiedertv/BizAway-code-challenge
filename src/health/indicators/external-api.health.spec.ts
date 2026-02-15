import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiHealthIndicator } from './external-api.health';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('ExternalApiHealthIndicator', () => {
  let indicator: ExternalApiHealthIndicator;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'TRIPS_API_BASE_URL') return 'http://api.com';
      if (key === 'TRIPS_API_KEY') return 'api-key';
      return null;
    }),
  };

  const mockHealthIndicatorService = {
    checkHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiHealthIndicator,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: HealthIndicatorService,
          useValue: mockHealthIndicatorService,
        },
      ],
    }).compile();

    indicator = module.get<ExternalApiHealthIndicator>(
      ExternalApiHealthIndicator,
    );
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should report healthy when API is up', async () => {
    const mockResponse: AxiosResponse = {
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      config: { headers: {} as any },
    };
    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const result = await indicator.isHealthy('external_trips_api');

    expect(result.external_trips_api.status).toBe('up');
    expect(result.external_trips_api.statusCode).toBe(200);
  });

  it('should report unhealthy when API returns error', async () => {
    const errorResponse = {
      response: { status: 500 },
      message: 'Internal Server Error',
    };
    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(throwError(() => errorResponse));

    // Use expect.objectContaining to check partial match if result structure is complex
    // Or check properties directly.
    const result = await indicator.isHealthy('external_trips_api');

    expect(result.external_trips_api.status).toBe('down');
    expect(result.external_trips_api.statusCode).toBe(500);
  });

  it('should report unhealthy when config is missing', async () => {
    jest.spyOn(configService, 'get').mockReturnValue(null);

    const result = await indicator.isHealthy('external_trips_api');

    expect(result.external_trips_api.status).toBe('down');
    expect(result.external_trips_api.message).toContain('not configured');
  });
});
