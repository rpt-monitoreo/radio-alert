import speech from '@google-cloud/speech';
import * as fs from 'fs';
import { protos } from '@google-cloud/speech';
import { exec } from 'child_process';

export async function transcribeWav(
  filePath: string,
  languageCode = 'es-ES',
): Promise<string> {
  const client = new speech.SpeechClient();
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString('base64');
  const audio = { content: audioBytes };
  const config = {
    encoding:
      protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
    sampleRateHertz: 16000,
    languageCode,
  };
  const request = { audio, config };
  const [response] = await client.recognize(request);
  const transcription =
    response.results?.map((r) => r.alternatives?.[0]?.transcript).join(' ') ||
    '';
  return transcription;
}
export function transcribeWithPython(chunkPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = `python ./scripts/getText.py "${chunkPath}"`;
    exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stderr);
      const match = stdout.match(/output:(.*)/);
      if (match) {
        resolve(match[1].trim());
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
