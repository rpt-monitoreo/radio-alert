import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { AudioService } from './audio.service';
import { FastifyReply } from 'fastify';
import { performance } from 'perf_hooks';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get()
  async getAudio(@Res() res: FastifyReply): Promise<void> {
    try {
      const startTime = performance.now();
      const file = await this.audioService.getAudioSnippet();
      const endTime = performance.now();
      console.log(`Execution time: ${endTime - startTime} milliseconds`);
      res.header('Content-Type', 'audio/mpeg');
      res.send(file);
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err.message });
    }
  }
}
