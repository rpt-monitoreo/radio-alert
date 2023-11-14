import { Controller, Post, Body } from '@nestjs/common';
import { AlertaService } from './alerta.service';
import { GetAlertasDto } from '@radio-alert/models';

@Controller('alerta')
export class AlertaController {
  constructor(private readonly alertaService: AlertaService) {}

  @Post()
  async getAlertas(@Body() getAlertasDto: GetAlertasDto) {
    return await this.alertaService.getAlertas(getAlertasDto);
  }
}
