// audio.service.ts
import { Injectable } from '@nestjs/common';
import { CreateFileDto, getDateFromFile } from '@repo/shared';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import stream from 'stream';

@Injectable()
export class AudioService {
  async createAudioSegment(
    createFileDto: CreateFileDto,
  ): Promise<{ startSeconds: number; duration: number }> {
    const { alert } = createFileDto;
    if (!alert) throw new Error('Alert not found');

    const filePath = path.resolve(alert.filePath ?? '');
    const outputPath = path.resolve(`./audioFiles/${createFileDto.output}.mp3`);

    let startSeconds = 0;
    if (outputPath.includes('segment')) {
      const fileTime = getDateFromFile(filePath);
      const endTime = new Date(alert.endTime ?? '');
      const endSeconds = (endTime.getTime() - fileTime.getTime()) / 1000;

      if (endSeconds > createFileDto.duration / 2)
        startSeconds = endSeconds - createFileDto.duration / 2;
    } else {
      startSeconds = createFileDto.startSecond;
    }

    if (
      (await this.checkFileExists(outputPath)) &&
      outputPath.includes('segment')
    ) {
      ffmpeg.ffprobe(outputPath, (_, metadata) => {
        const duration = metadata.format.duration;
        return { startSeconds, duration };
      });
    }

    let duration = 0;
    if (outputPath.includes('segment')) {
      duration = await this.extractAudioSegment(
        filePath,
        startSeconds,
        createFileDto.duration,
        16,
        8000,
        outputPath,
        'mp3',
      );
    } else {
      //Fragment
      const durations = await Promise.all([
        this.extractAudioSegment(
          filePath,
          startSeconds,
          createFileDto.duration,
          32,
          16000,
          outputPath,
          'mp3',
        ),
        this.extractAudioSegment(
          filePath,
          startSeconds,
          Math.min(createFileDto.duration, 180),
          128000,
          44100,
          outputPath.replace('mp3', 'wav'),
          'wav',
        ),
      ]);
      duration = durations[0];
    }

    return { startSeconds: startSeconds, duration };
  }

  async extractAudioSegment(
    filePath: string,
    startSeconds: number,
    duration: number,
    audioBitrate: number,
    audioFrequency: number,
    outputPath: string,
    format: string,
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const command = ffmpeg(filePath)
        .setStartTime(startSeconds)
        .setDuration(duration)
        .audioBitrate(audioBitrate) // Lower bitrate Reduce file size
        .audioFrequency(audioFrequency) // Lower sample rate reduce elapsed time
        .audioChannels(1) // Convert to mono
        .outputOptions('-preset ultrafast')
        .toFormat(format)
        .output(outputPath);

      if (format == 'mp3') {
        command.audioCodec('libmp3lame');
      }

      command
        .on('end', function () {
          // Usar ffprobe para obtener la duración del archivo procesado
          ffmpeg.ffprobe(outputPath, (err, metadata) => {
            if (err) {
              reject(new Error(err));
            } else {
              resolve(metadata.format.duration ?? 0);
            }
          });
        })
        .on('error', function (err) {
          return reject(err.toString());
        })
        .run();
    });
  }

  async getAudioFileByName(filename: string): Promise<stream.Readable | null> {
    const filePath = path.resolve(`./audioFiles/${filename}.mp3`);
    if (!fs.existsSync(filePath)) return null;
    try {
      return fs.createReadStream(filePath);
    } catch (error) {
      throw new Error(String(error));
    }
  }

  /**
   * Gets the duration of an audio file using ffprobe from fluent-ffmpeg.
   *
   * @param filePath The path to the audio file.
   * @returns A promise that resolves with the duration of the audio file in seconds.
   */
  async getAudioDuration(filePath: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(new Error(err));
        else resolve(metadata.format.duration ?? 0);
      });
    });
  }

  async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true; // El archivo existe
    } catch {
      return false; // El archivo no existe
    }
  }
}
