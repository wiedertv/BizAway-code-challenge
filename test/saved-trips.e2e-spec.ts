import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import mongoose from 'mongoose';
import { AppModule } from './../src/app.module';
import { SaveTripDto } from './../src/saved-trips/application/dtos/save-trip.dto';
import { App } from 'supertest/types';
import { SavedTripResponseDto } from './../src/saved-trips/application/dtos/saved-trip-response.dto';

describe('SavedTripsController (e2e)', () => {
  let app: INestApplication;
  let sessionId: string;
  let savedTripId: string;

  const mockTrip: SaveTripDto = {
    tripId: 'e2e-trip-123',
    origin: 'SYD',
    destination: 'GRU',
    cost: 1500,
    duration: 14,
    type: 'flight',
    displayName: 'E2E Test Flight',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await app.close();
  });

  it('/saved-trips (POST) - Initial save (should generate session-id)', async () => {
    const response = await request(app.getHttpServer() as App)
      .post('/saved-trips')
      .send(mockTrip)
      .expect(HttpStatus.CREATED);

    // ResponseInterceptor wraps data in "data" property
    const data = (response.body as { data: SavedTripResponseDto }).data;

    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('sessionId');
    expect(data.tripId).toEqual(mockTrip.tripId);

    // Capture the generated sessionId for subsequent requests
    sessionId = data.sessionId;
    savedTripId = data.id;

    expect(sessionId).toBeDefined();
  });

  it('/saved-trips (POST) - Save another trip with existing session-id', async () => {
    const secondTrip = { ...mockTrip, tripId: 'e2e-trip-456' };

    const response = await request(app.getHttpServer() as App)
      .post('/saved-trips')
      .set('x-session-id', sessionId)
      .send(secondTrip)
      .expect(HttpStatus.CREATED);

    const data = (response.body as { data: SavedTripResponseDto }).data;
    expect(data.sessionId).toEqual(sessionId);
    expect(data.tripId).toEqual('e2e-trip-456');
  });

  it('/saved-trips (GET) - Retrieve trips', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/saved-trips')
      .set('x-session-id', sessionId)
      .expect(HttpStatus.OK);

    const data = (response.body as { data: SavedTripResponseDto[] }).data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data[0].sessionId).toEqual(sessionId);
  });

  it('/saved-trips/:id (DELETE) - Delete a trip', async () => {
    await request(app.getHttpServer() as App)
      .delete(`/saved-trips/${savedTripId}`)
      .set('x-session-id', sessionId)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('/saved-trips (GET) - Verify deletion', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/saved-trips')
      .set('x-session-id', sessionId)
      .expect(HttpStatus.OK);

    const data = (response.body as { data: SavedTripResponseDto[] }).data;
    const deletedTrip = data.find((t) => t.id === savedTripId);
    expect(deletedTrip).toBeUndefined();
  });

  it('/saved-trips (GET) - Fail without session-id', async () => {
    await request(app.getHttpServer() as App)
      .get('/saved-trips')
      .expect(HttpStatus.BAD_REQUEST);
  });
});
