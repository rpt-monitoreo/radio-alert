import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioModule } from './audio/audio.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertasModule } from './alertas/alerta.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Alertas } from './alertas/alerta.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URI') + '/monitoreo',
        entities: [Alertas],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    AudioModule,
    AlertasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
