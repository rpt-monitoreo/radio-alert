import {
  Controller,
  Post,
  HttpStatus,
  Body,
  HttpException,
  Get,
  Param,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PlatformDto } from '@repo/shared';
import { Platform } from '../entities';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('get-platforms/:media')
  async getPlatforms(@Param('media') media: string): Promise<Platform[]> {
    try {
      return await this.settingsService.getPlatforms(media);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request get-platforms ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('update-platform')
  async updatePlatform(@Body() platformDto: PlatformDto): Promise<Platform> {
    try {
      return await this.settingsService.updatePlatform(platformDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request update-platform ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
