// audio.service.ts
import { Injectable } from '@nestjs/common';
import { GetFileDto } from '@radio-alert/models';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import stream from 'stream';

@Injectable()
export class AudioService {
  async createAudioSegment(getFileDto: GetFileDto): Promise<number> {
    const filePath = path.resolve(getFileDto.filePath);
    const outputPath = path.resolve(`./audio/${getFileDto.output}.mp3`);

    const fileName = path.basename(filePath);
    const parts = fileName.split('_');
    if (parts.length < 3) throw new Error('Invalid file name format.');

    const fileTime = new Date(`${parts[1]}T${parts[2].split('.')[0].replace(/-/g, ':')}.000Z`);
    const endTime = new Date(getFileDto.endTime);
    const endSeconds = (endTime.getTime() - fileTime.getTime()) / 1000;
    let startSeconds = 0;
    if (endSeconds > getFileDto.duration / 2) startSeconds = endSeconds - getFileDto.duration / 2;

    // Extract the last # seconds of the audio file
    await new Promise<fs.ReadStream>((resolve, reject) => {
      ffmpeg(filePath)
        .setStartTime(startSeconds)
        .setDuration(getFileDto.duration)
        .audioBitrate(16) // Lower bitrate Reduce file size
        .audioFrequency(8000) // Lower sample rate reduce elapsed time
        .audioChannels(1) // Convert to mono
        .outputOptions('-preset ultrafast')
        .audioCodec('libmp3lame')
        .toFormat('mp3')
        .output(outputPath)
        .on('end', function () {
          const file = fs.createReadStream(outputPath);
          resolve(file);
        })
        .on('error', function (err) {
          reject(new Error(err));
        })
        .run();
    });

    return startSeconds;
  }

  async getAudioFileByName(filename: string): Promise<stream.Readable | null> {
    const filePath = path.resolve(`./audio/${filename}.mp3`);
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
    const filePath = path.resolve(`./audio/${filename}.mp3`);

    try {
      await fs.promises.unlink(filePath); // Use await with fs.promises.unlink
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
}
