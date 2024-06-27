// alerta.service.ts
import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOneOptions,
  FindOptionsWhere,
  MongoRepository,
} from 'typeorm';
import { Alert } from './alerts.entity';
import { GetAlertsDto, ValidDatesDto } from '@radio-alert/models';

@Injectable()
export class AlertsService {
  alertsRepo: MongoRepository<Alert>;
  constructor(private dataSource: DataSource) {
    this.alertsRepo = this.dataSource.getMongoRepository(Alert);
  }

  async getAlerts(getAlertasDto: GetAlertsDto) {
    console.log('getAlertasDto', getAlertasDto);

    if (!getAlertasDto) {
      throw new Error('getAlertasDto is undefined');
    }
    const { startDate = '', endDate = '', clientName = '' } = getAlertasDto;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    const findOptions: FindOneOptions<Alert> = {
      where: {
        endTime: {
          $gte: new Date(startDate + 'T00:00:00.000Z'),
          $lte: new Date(endDate + 'T23:59:59.999Z'),
        },
        ...(clientName && { clientName }),
      } as unknown as FindOptionsWhere<Alert>,
    };
    return this.alertsRepo.find(findOptions);
  }

  async getValidDates(
    getAlertsDto: Partial<GetAlertsDto>
  ): Promise<ValidDatesDto> {
    const getAlerts = getAlertsDto || {};
    const { clientName } = getAlerts;
    const query: FindOneOptions<Alert> = {
      where: { ...(clientName && { clientName }) },
    };
    // Get the first document by ascending order of date
    const min = await this.alertsRepo.findOne({
      ...query,
      order: { endTime: 'ASC' },
    });

    // Get the last document by descending order of date
    const max = await this.alertsRepo.findOne({
      ...query,
      order: { endTime: 'DESC' },
    });

    return {
      minDate: this.getDate(min.endTime),
      maxDate: this.getDate(max.endTime),
    };
  }

  getDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
