import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ExternalApiHealthIndicator } from './indicators/external-api.health';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthCheckService;

  const mockHealthService = {
    check: jest.fn(),
  };

  const mockDbIndicator = {
    pingCheck: jest.fn(),
  };

  const mockMemoryIndicator = {
    checkHeap: jest.fn(),
    checkRSS: jest.fn(),
  };

  const mockDiskIndicator = {
    checkStorage: jest.fn(),
  };

  const mockExternalApiIndicator = {
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthService },
        { provide: MongooseHealthIndicator, useValue: mockDbIndicator },
        { provide: MemoryHealthIndicator, useValue: mockMemoryIndicator },
        { provide: DiskHealthIndicator, useValue: mockDiskIndicator },
        {
          provide: ExternalApiHealthIndicator,
          useValue: mockExternalApiIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthCheckService>(HealthCheckService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkLiveness', () => {
    it('should return health check result', async () => {
      const mockResult = {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      };

      mockHealthService.check.mockResolvedValue(mockResult);

      const result = await controller.checkLiveness();
      expect(result).toEqual(mockResult);
      expect(
        (healthService as unknown as { check: jest.Mock }).check,
      ).toHaveBeenCalledWith([]);
    });
  });

  describe('checkReadiness', () => {
    it('should check db and memory', async () => {
      const mockResult = {
        status: 'ok',
        info: { database: { status: 'up' }, memory_heap: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' }, memory_heap: { status: 'up' } },
      };

      mockHealthService.check.mockResolvedValue(mockResult);

      const result = await controller.checkReadiness();
      expect(result).toEqual(mockResult);

      expect(
        (healthService as unknown as { check: jest.Mock }).check,
      ).toHaveBeenCalled();
    });
  });

  describe('checkDetailed', () => {
    it('should check all indicators', async () => {
      const mockResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          disk_storage: { status: 'up' },
          external_trips_api: { status: 'up' },
        },
        error: {},
        details: {},
      };

      mockHealthService.check.mockResolvedValue(mockResult);

      const result = await controller.checkDetailed();
      expect(result).toEqual(mockResult);
      expect(
        (healthService as unknown as { check: jest.Mock }).check,
      ).toHaveBeenCalled();
    });
  });
});
