import { Module } from '@nestjs/common';
import { AlertaController } from './alerta.controller';
import { AlertaService } from './alerta.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alertas } from './alerta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alertas])],
  controllers: [AlertaController],
  providers: [AlertaService],
})
export class AlertasModule {}
