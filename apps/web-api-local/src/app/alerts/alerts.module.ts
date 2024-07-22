import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alerts.entity';
import { Transcription } from './transcription.entity';
import { ConfigService } from '@nestjs/config';
import { Note } from './note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Transcription, Note])],
  controllers: [AlertsController],
  providers: [AlertsService, ConfigService],
})
export class AlertsModule {}
