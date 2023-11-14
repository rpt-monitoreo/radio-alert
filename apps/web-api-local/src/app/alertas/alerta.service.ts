// alerta.service.ts
import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Alertas } from './alerta.entity';
import { GetAlertasDto } from '@radio-alert/models';

@Injectable()
export class AlertaService {
  alertaRepo: Repository<Alertas>;
  constructor(private dataSource: DataSource) {
    this.alertaRepo = this.dataSource.getRepository(Alertas);
  }

  async getAlertas(getAlertasDto: GetAlertasDto) {
    const { fechaInicio, fechaFinal, palabra } = getAlertasDto;
    const findOptions: FindOneOptions<Alertas> = {
      where: {
        date: {
          $gte: new Date(fechaInicio + 'T00:00:00.000Z'),
          $lte: new Date(fechaFinal + 'T23:59:59.999Z'),
        },
        ...(palabra && { palabra }),
      } as unknown as FindOptionsWhere<Alertas>,
    };
    return this.alertaRepo.find(findOptions);
  }
}
