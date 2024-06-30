import { Controller, Post, Res, HttpStatus, Body } from '@nestjs/common';
import { AudioService } from './audio.service';
import { FastifyReply } from 'fastify';
import { performance } from 'perf_hooks';
import { GetFileDto } from '@radio-alert/models';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('fetchFile')
  async getAudio(@Body() getFileDto: GetFileDto, @Res() res: FastifyReply): Promise<void> {
    try {
      const startTime = performance.now();
      const { file, startSeconds } = await this.audioService.getAudioSnippet(getFileDto);
      const endTime = performance.now();
      console.log(`Execution time: ${endTime - startTime} milliseconds`);
      res.header('Content-Type', 'audio/mpeg');
      res.header('X-Start-Second', startSeconds.toString());
      res.send(file);
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err.message });
    }
  }
}
