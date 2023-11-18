import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { GetAlertsDto } from '@radio-alert/models';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertService: AlertsService) {}

  @Post()
  async getAlerts(@Body() getAlertsDto: GetAlertsDto) {
    try {
      return await this.alertService.getAlerts(getAlertsDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request getAlerts ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('dates')
  async getValidDates(@Body() getAlertsDto: Partial<GetAlertsDto>) {
    try {
      return await this.alertService.getValidDates(getAlertsDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request getValidDates ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
