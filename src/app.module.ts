import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { TripsModule } from './trips/trips.module';
import { SavedTripsModule } from './saved-trips/saved-trips.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const useInMemoryDb = configService.get<boolean>('USE_IN_MEMORY_DB');
        if (useInMemoryDb) {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create();
          const uri = mongod.getUri();
          return {
            uri,
          };
        }
        const uri = configService.get<string>('MONGODB_URI');
        return { uri };
      },
    }),
    TripsModule,
    SavedTripsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
