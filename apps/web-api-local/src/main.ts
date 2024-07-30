/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

import compression from '@fastify/compress';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
//import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));
  app.enableCors();
  app.register(compression);
  //const configService = app.get(ConfigService);
  const globalPrefix = '';
  app.setGlobalPrefix(globalPrefix);
  const port = 3000; // configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');

  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
