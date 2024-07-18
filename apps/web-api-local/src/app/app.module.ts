import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioModule } from './audio/audio.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsModule } from './alerts/alerts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Alert } from './alerts/alerts.entity';
import { Transcription } from './alerts/transcription.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URI') + '/monitoring',
        entities: [Alert, Transcription],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    AudioModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
