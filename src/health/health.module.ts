import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiHealthIndicator } from './indicators/external-api.health';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [ExternalApiHealthIndicator],
})
export class HealthModule {}
