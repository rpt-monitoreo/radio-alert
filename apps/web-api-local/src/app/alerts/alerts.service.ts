// alerta.service.ts
import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOneOptions,
  FindOptionsWhere,
  MongoRepository,
} from 'typeorm';
import { Alert } from './alerts.entity';
import { GetAlertsDto } from '@radio-alert/models';

@Injectable()
export class AlertsService {
  alertsRepo: MongoRepository<Alert>;
  constructor(private dataSource: DataSource) {
    this.alertsRepo = this.dataSource.getMongoRepository(Alert);
  }

  async getAlerts(getAlertasDto: GetAlertsDto) {
    const { startDate, endDate, client } = getAlertasDto;
    const findOptions: FindOneOptions<Alert> = {
      where: {
        date: {
          $gte: new Date(startDate + 'T00:00:00.000Z'),
          $lte: new Date(endDate + 'T23:59:59.999Z'),
        },
        ...(client && { client }),
      } as unknown as FindOptionsWhere<Alert>,
    };
    return this.alertsRepo.find(findOptions);
  }

  async getValidDates(getAlertsDto: Partial<GetAlertsDto>) {
    const getAlerts = getAlertsDto || {};
    const { client } = getAlerts;
    const query: FindOneOptions<Alert> = {
      where: { ...(client && { client }) },
    };
    // Get the first document by ascending order of date
    const min = await this.alertsRepo.findOne({
      ...query,
      order: { date: 'ASC' },
    });

    // Get the last document by descending order of date
    const max = await this.alertsRepo.findOne({
      ...query,
      order: { date: 'DESC' },
    });

    return { minDate: min.date, maxDate: max.date };
  }
}
