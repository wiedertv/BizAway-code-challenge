import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ExternalApiHealthIndicator } from './indicators/external-api.health';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private externalApi: ExternalApiHealthIndicator,
  ) {}

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe - checks if the application is running',
  })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HealthCheck()
  async checkLiveness() {
    const result = await this.health.check([]);
    const { ...response } = result;
    return response;
  }

  @Get('ready')
  @ApiOperation({
    summary:
      'Readiness probe - checks if the application is ready to serve traffic',
  })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  @HealthCheck()
  async checkReadiness() {
    const result = await this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
    const { ...response } = result;
    return response;
  }

  @Get('detailed')
  @ApiOperation({
    summary: 'Detailed health check - comprehensive status of all dependencies',
  })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  @ApiResponse({
    status: 503,
    description: 'One or more services are unhealthy',
  })
  @HealthCheck()
  async checkDetailed() {
    const result = await this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk_storage', {
          path: '/',
          thresholdPercent: 0.8,
        }),

      () => this.externalApi.isHealthy('external_trips_api'),
    ]);
    const { ...response } = result;
    return response;
  }
}
