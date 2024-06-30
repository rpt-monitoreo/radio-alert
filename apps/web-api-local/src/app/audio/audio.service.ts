// audio.service.ts
import { Injectable } from '@nestjs/common';
import { GetFileDto } from '@radio-alert/models';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import stream from 'stream';

@Injectable()
export class AudioService {
  async getAudioSnippet(getFileDto: GetFileDto): Promise<{ file: stream.Readable; startSeconds: number }> {
    const filePath = path.resolve(getFileDto.filePath);
    const outputPath = path.resolve('./output.mp3');

    const fileName = path.basename(filePath);
    const parts = fileName.split('_');
    if (parts.length < 3) throw new Error('Invalid file name format.');

    const fileTime = new Date(`${parts[1]}T${parts[2].split('.')[0].replace(/-/g, ':')}.000Z`);
    const endTime = new Date(getFileDto.endTime);
    const endSeconds = (endTime.getTime() - fileTime.getTime()) / 1000;
    let startSeconds = 0;
    if (endSeconds > getFileDto.duration / 2) startSeconds = endSeconds - getFileDto.duration / 2;
    // Get the duration of the audio file
    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(new Error(err));
        else resolve(metadata.format.duration);
      });
    });

    console.log(`Duration: ${duration}`);

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

    const file = fs.createReadStream(outputPath);
    return { file, startSeconds };
  }
}
