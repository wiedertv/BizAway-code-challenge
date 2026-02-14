import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';
import {
  TripRepository,
  SearchTripCriteria,
} from '../../domain/repositories/trip.repository.interface';
import { Trip } from '../../domain/entities/trip.entity';
import { TripMapper } from '../mappers/trip.mapper';
import { TripsApiResponse } from '../interfaces/trips-api-response.interface';

@Injectable()
export class ApiTripRepository implements TripRepository {
  private readonly logger = new Logger(ApiTripRepository.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('TRIPS_API_KEY', '');
    this.baseUrl = this.configService.get<string>('TRIPS_API_BASE_URL', '');

    if (!this.apiKey || !this.baseUrl) {
      this.logger.error(
        'Missing configuration: TRIPS_API_KEY or TRIPS_API_BASE_URL',
      );
    }
  }

  async findAll(criteria: SearchTripCriteria): Promise<Trip[]> {
    const { origin, destination } = criteria;
    const url = `${this.baseUrl}/trips`;

    try {
      const response$ = this.httpService
        .get<TripsApiResponse[]>(url, {
          params: { origin, destination },
          headers: { 'x-api-key': this.apiKey },
        })
        .pipe(
          map((response) =>
            response.data.map((trip) => TripMapper.toDomain(trip)),
          ),
          catchError((e: unknown) => {
            const errorMessage =
              e instanceof Error ? e.message : 'Unknown error';
            const errorData =
              e && typeof e === 'object' && 'response' in e
                ? (e as { response?: { data?: unknown } }).response?.data
                : undefined;

            this.logger.error(
              `External API Error: ${errorMessage}`,
              errorData ? JSON.stringify(errorData) : '',
            );
            throw new UnprocessableEntityException(
              'Failed to fetch trips from external provider',
            );
          }),
        );

      return await lastValueFrom(response$);
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Unexpected repository error: ${errorMessage}`,
        errorStack,
      );
      throw new UnprocessableEntityException(
        'An unexpected error occurred while fetching trips',
      );
    }
  }
}
