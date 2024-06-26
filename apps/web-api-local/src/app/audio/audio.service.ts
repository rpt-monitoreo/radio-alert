// audio.service.ts
import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import stream from 'stream';

@Injectable()
export class AudioService {
  async getAudioSnippet(): Promise<stream.Readable> {
    const filePath = path.resolve(
      'C:/Radio/2024/6/25/BluBucaramanga/BluBucaramanga_2024-06-25_00-00-20.mp3'
    );
    const outputPath = path.resolve('./output.mp3');

    // Get the duration of the audio file
    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration);
      });
    });

    // Extract the last # seconds of the audio file
    await new Promise<fs.ReadStream>((resolve, reject) => {
      ffmpeg(filePath)
        .setStartTime(duration - 1800) //30min
        .setDuration(1800)
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
          console.log('An error occurred: ' + err.message);
          reject(err);
        })
        .run();
    });

    const stream = fs.createReadStream(outputPath);
    return stream;
  }
}
