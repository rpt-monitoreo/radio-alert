import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alerts.entity';
import { Transcription } from './transcription.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Transcription])],
  controllers: [AlertsController],
  providers: [AlertsService, ConfigService],
})
export class AlertsModule {}
