import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { GetAlertsDto, GetSummaryDto, GetTranscriptionDto } from '@radio-alert/models';

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

  @Post('getText')
  async getText(@Body() getTranscriptionDto: GetTranscriptionDto) {
    try {
      return await this.alertService.getText(getTranscriptionDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request getText ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('getSummary')
  async getSummary(@Body() getSummaryDto: GetSummaryDto): Promise<string> {
    try {
      return await this.alertService.getChatResponse(getSummaryDto.text);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request getSummary  ${error}`,
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
