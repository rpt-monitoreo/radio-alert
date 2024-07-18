import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alerts.entity';
import { Transcription } from './transcription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Transcription])],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
