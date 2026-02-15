import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalApiHealthIndicator {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const baseUrl = this.configService.get<string>('TRIPS_API_BASE_URL');
    const apiKey = this.configService.get<string>('TRIPS_API_KEY');

    if (!baseUrl) {
      return {
        [key]: {
          status: 'down',
          message: 'TRIPS_API_BASE_URL not configured',
        },
      };
    }

    if (!apiKey) {
      return {
        [key]: {
          status: 'down',
          message: 'TRIPS_API_KEY not configured',
        },
      };
    }

    try {
      const startTime = Date.now();

      const response = await firstValueFrom(
        this.httpService.get(`${baseUrl}/trips`, {
          timeout: 5000,
          params: { origin: 'SYD', destination: 'GRU' },
          headers: { 'x-api-key': apiKey }, // Add API key header
        }),
      );

      const responseTime = Date.now() - startTime;
      const isHealthy = response.status === 200;

      return {
        [key]: {
          status: isHealthy ? 'up' : 'down',
          statusCode: response.status,
          responseTime: `${responseTime}ms`,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const statusCode =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      return {
        [key]: {
          status: 'down',
          error: errorMessage,
          statusCode: statusCode || 'N/A',
        },
      };
    }
  }
}
