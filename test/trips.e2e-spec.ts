import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  ValidationPipe,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpService } from '@nestjs/axios';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { of } from 'rxjs';
import mongoose from 'mongoose';

describe('TripsController (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;

  const mockExternalTrips = [
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
    {
      id: 'trip-2',
      origin: 'SYD',
      destination: 'GRU',
      cost: 2000,
      duration: 5,
      type: 'flight',
      display_name: 'Fast Flight',
      arrival: '2026-02-15T05:00:00Z',
      departure: '2026-02-15T00:00:00Z',
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue({
        get: jest.fn().mockReturnValue(
          of({
            data: mockExternalTrips,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { headers: {} },
          }),
        ),
      })
      .overrideInterceptor(CacheInterceptor)
      .useValue({
        intercept: (context: ExecutionContext, next: CallHandler) =>
          next.handle(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    httpService = moduleFixture.get<HttpService>(HttpService);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await app.close();
  });

  it('/trips/search (GET) - Search trips sorted by cheapest', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/trips/search')
      .query({ origin: 'SYD', destination: 'GRU', sort_by: 'cheapest' })
      .expect(HttpStatus.OK);

    const data = (
      response.body as { data: { cost: number; duration: number }[] }
    ).data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);
    expect(data[0].cost).toBe(1000);
    expect(data[1].cost).toBe(2000);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(httpService.get as unknown as jest.Mock).toHaveBeenCalled();
  });

  it('/trips/search (GET) - Search trips sorted by fastest', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/trips/search')
      .query({ origin: 'SYD', destination: 'GRU', sort_by: 'fastest' })
      .expect(HttpStatus.OK);

    const data = (
      response.body as { data: { cost: number; duration: number }[] }
    ).data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);
    expect(data[0].duration).toBe(5);
    expect(data[1].duration).toBe(10);
  });

  it('/trips/search (GET) - Fail validation on missing parameters', async () => {
    await request(app.getHttpServer() as App)
      .get('/trips/search')
      .query({ origin: 'SYD' }) // Missing destination
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/trips/search (GET) - Handle external API errors', async () => {
    jest.spyOn(httpService, 'get').mockReturnValueOnce(
      of({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        config: {} as any,
      }),
    );

    const response = await request(app.getHttpServer() as App)
      .get('/trips/search')
      .query({ origin: 'SYD', destination: 'GRU', sort_by: 'fastest' })
      .expect(HttpStatus.OK);

    expect((response.body as { data: unknown[] }).data).toEqual([]);
  });
});
