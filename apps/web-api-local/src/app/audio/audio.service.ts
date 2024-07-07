// audio.service.ts
import { Injectable } from '@nestjs/common';
import { CreateFileDto, getDateFromFile } from '@radio-alert/models';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import stream from 'stream';
import { chmod } from 'fs/promises';
import { rimraf } from 'rimraf';

@Injectable()
export class AudioService {
  async createAudioSegment(createFileDto: CreateFileDto): Promise<{ startSeconds: number; duration: number }> {
    const filePath = path.resolve(createFileDto.filePath);
    const outputPath = path.resolve(`./audioFiles/${createFileDto.output}.mp3`);
    let startSeconds = 0;
    if (createFileDto.endTime) {
      const fileTime = getDateFromFile(filePath);
      const endTime = new Date(createFileDto.endTime);
      const endSeconds = (endTime.getTime() - fileTime.getTime()) / 1000;

      if (endSeconds > createFileDto.duration / 2) startSeconds = endSeconds - createFileDto.duration / 2;
    } else {
      startSeconds = createFileDto.startSecond;
    }

    if ((await this.checkFileExists(outputPath)) && outputPath.includes('segment')) {
      ffmpeg.ffprobe(outputPath, (_, metadata) => {
        const duration = metadata.format.duration;
        return { startSeconds, duration };
      });
    }

    // Extract the last # seconds of the audio file
    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg(filePath)
        .setStartTime(startSeconds)
        .setDuration(createFileDto.duration)
        .audioBitrate(outputPath.includes('segment') ? 16 : 32) // Lower bitrate Reduce file size
        .audioFrequency(outputPath.includes('segment') ? 8000 : 16000) // Lower sample rate reduce elapsed time
        .audioChannels(1) // Convert to mono
        .outputOptions('-preset ultrafast')
        .audioCodec('libmp3lame')
        .toFormat('mp3')
        .output(outputPath)
        .on('end', function () {
          // Usar ffprobe para obtener la duración del archivo procesado
          ffmpeg.ffprobe(outputPath, (err, metadata) => {
            if (err) {
              reject(new Error(err));
            } else {
              resolve(metadata.format.duration);
            }
          });
        })
        .on('error', function (err) {
          reject(new Error(err));
        })
        .run();
    });

    return { startSeconds: startSeconds, duration };
  }

  async getAudioFileByName(filename: string): Promise<stream.Readable | null> {
    const filePath = path.resolve(`./audioFiles/${filename}.mp3`);
    if (!fs.existsSync(filePath)) return null;
    try {
      return fs.createReadStream(filePath);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Deletes an audio file by its name.
   *
   * @param filename The name of the file to delete.
   * @returns A promise that resolves to true if the file was successfully deleted, or false if the file was not found.
   */
  async deleteAudioFileByName(filename: string): Promise<boolean> {
    const filePath = path.resolve(`./audioFiles/${filename}.mp3`);

    try {
      await chmod(filePath, 0o777);
      await rimraf(filePath); // Use await with fs.promises.unlink
      return true; // File successfully deleted
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File does not exist
        return false;
      } else {
        // Other errors, rethrow or handle as needed
        throw error;
      }
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
        else resolve(metadata.format.duration);
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
