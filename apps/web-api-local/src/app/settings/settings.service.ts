// audio.service.ts
import { Injectable } from '@nestjs/common';
import { PlatformDto } from '@radio-alert/models';

import { DataSource, MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Platform } from '../entities';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class SettingsService {
  platformRepo: MongoRepository<Platform>;

  constructor(@InjectDataSource('config') private readonly dataSource: DataSource) {
    this.platformRepo = this.dataSource.getMongoRepository(Platform);
  }

  async getPlatforms(media: string): Promise<Platform[]> {
    console.log('media', media);

    return this.platformRepo.find({ where: { media: media } });
  }

  async updatePlatform(platformDto: PlatformDto): Promise<Platform> {
    const existingPlatform = await this.platformRepo.findOneBy({ _id: new ObjectId(platformDto.id) });

    if (!existingPlatform) {
      throw new Error('Platform not found');
    }

    // Update the platform with new data
    existingPlatform.name = platformDto.name;
    existingPlatform.url = platformDto.url;
    existingPlatform.media = platformDto.media;
    existingPlatform.name = platformDto.name;
    existingPlatform.slots = platformDto.slots;

    // Save the updated platform
    return await this.platformRepo.save(existingPlatform);
  }
}
