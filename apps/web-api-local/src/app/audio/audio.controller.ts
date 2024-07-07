import { Controller, Post, Res, HttpStatus, Body, Get, Param, Delete } from '@nestjs/common';
import { AudioService } from './audio.service';
import { FastifyReply } from 'fastify';
import { CreateFileDto } from '@radio-alert/models';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('createFile')
  async getAudio(@Body() createFileDto: CreateFileDto, @Res() res: FastifyReply): Promise<void> {
    try {
      const { startSeconds, duration } = await this.audioService.createAudioSegment(createFileDto);
      res.header('Content-Type', 'application/json');
      res.send({ startSeconds, duration });
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err.message });
    }
  }

  @Get('fetchByName/:filename')
  async getAudioByName(@Param('filename') filename: string, @Res() res: FastifyReply): Promise<void> {
    let audioStream;
    try {
      audioStream = await this.audioService.getAudioFileByName(filename);
      if (!audioStream) {
        res.status(HttpStatus.NOT_FOUND).send({ error: 'File not found' });
        return;
      }
      res.header('Content-Type', 'audio/mpeg');
      res.send(audioStream);
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err.message });
    }
  }

  @Delete('deleteByName/:filename')
  async deleteAudioByName(@Param('filename') filename: string, @Res() res: FastifyReply): Promise<void> {
    try {
      const deletionResult = await this.audioService.deleteAudioFileByName(filename);
      if (!deletionResult) {
        res.status(HttpStatus.NOT_FOUND).send({ error: 'File not found or could not be deleted' });
        return;
      }

      res.status(HttpStatus.OK).send({ message: 'File successfully deleted' });
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err.message });
    }
  }
}
