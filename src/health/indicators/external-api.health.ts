import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalApiHealthIndicator extends HealthIndicator {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const baseUrl = this.configService.get<string>('TRIPS_API_BASE_URL');
    const apiKey = this.configService.get<string>('TRIPS_API_KEY');

    if (!baseUrl) {
      return this.getStatus(key, false, {
        message: 'TRIPS_API_BASE_URL not configured',
      });
    }

    if (!apiKey) {
      return this.getStatus(key, false, {
        message: 'TRIPS_API_KEY not configured',
      });
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${baseUrl}/trips`, {
          timeout: 5000,
          params: { origin: 'SYD', destination: 'GRU' },
          headers: { 'x-api-key': apiKey }, // Add API key header
        }),
      );

      const isHealthy = response.status === 200;

      return this.getStatus(key, isHealthy, {
        statusCode: response.status,
        responseTime: response.headers['x-response-time'] || 'N/A',
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      const statusCode = error?.response?.status;

      return this.getStatus(key, false, {
        error: errorMessage,
        statusCode: statusCode || 'N/A',
      });
    }
  }
}
