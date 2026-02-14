import { validate } from 'class-validator';
import { SearchTripDto, SortStrategy } from './search-trip.dto';

describe('SearchTripDto', () => {
  it('should pass with valid data', async () => {
    const dto = new SearchTripDto();
    dto.origin = 'SYD';
    dto.destination = 'JFK';
    dto.sort_by = SortStrategy.FASTEST;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid IATA code', async () => {
    const dto = new SearchTripDto();
    dto.origin = 'XXX'; // Invalid code
    dto.destination = 'JFK';
    dto.sort_by = SortStrategy.CHEAPEST;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isIataCode');
  });

  it('should fail with invalid sort strategy', async () => {
    const dto = new SearchTripDto();
    dto.origin = 'SYD';
    dto.destination = 'JFK';
    dto.sort_by = 'random' as unknown as SortStrategy;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.constraints).toHaveProperty('isEnum');
  });
});
