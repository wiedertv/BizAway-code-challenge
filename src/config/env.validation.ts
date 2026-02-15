import {
  IsString,
  IsInt,
  IsUrl,
  IsBoolean,
  IsOptional,
  validateSync,
} from 'class-validator';
import { plainToClass, Transform, Type } from 'class-transformer';

export class EnvironmentVariables {
  @IsInt()
  PORT: number = 3000;

  @IsString()
  TRIPS_API_KEY!: string;

  @IsUrl({ require_tld: false })
  TRIPS_API_BASE_URL!: string;

  @IsString()
  @IsOptional()
  MONGODB_URI?: string = 'mongodb://localhost:27017/trip-planner';

  @IsBoolean()
  @IsOptional()
  @Type(() => String)
  @Transform(({ value }: { value: string }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  USE_IN_MEMORY_DB?: boolean = true;

  @IsString()
  CORS_ORIGINS: string = '*';

  @IsInt()
  RATE_LIMIT_TTL: number = 60;

  @IsInt()
  RATE_LIMIT_MAX: number = 100;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints)
          : [];
        return `  - ${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(`❌ Environment validation failed:\n${errorMessages}`);
  }

  return validatedConfig;
}
