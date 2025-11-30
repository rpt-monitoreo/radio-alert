import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

export async function splitAudio(
  filePath: string,
  segmentDuration: number = 60,
  audioBitrate = '64k',
  audioFrequency = 16000,
  format = 'wav',
  customFfmpegPath?: string,
): Promise<string[]> {
  if (customFfmpegPath) {
    ffmpeg.setFfmpegPath(customFfmpegPath);
  }
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      if (!duration) return reject(new Error('No duration found'));
      const outDir = path.join(path.dirname(filePath), 'chunks_' + Date.now());
      fs.mkdirSync(outDir);
      const chunkPaths: string[] = [];
      const promises: Promise<void>[] = [];
      for (let i = 0; i < duration; i += segmentDuration) {
        const chunkPath = path.join(outDir, `chunk_${i}.${format}`);
        chunkPaths.push(chunkPath);
        promises.push(
          new Promise((res, rej) => {
            const command = ffmpeg(filePath)
              .setStartTime(i)
              .setDuration(segmentDuration)
              .audioBitrate(audioBitrate)
              .audioFrequency(audioFrequency)
              .audioChannels(1)
              .outputOptions('-preset ultrafast')
              .toFormat(format)
              .output(chunkPath)
              .on('end', () => res())
              .on('error', rej);
            if (format === 'mp3') {
              command.audioCodec('libmp3lame');
            }
            command.run();
          }),
        );
      }
      Promise.all(promises)
        .then(() => resolve(chunkPaths))
        .catch(reject);
    });
  });
}
