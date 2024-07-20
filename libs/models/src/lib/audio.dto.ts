import { AlertDto } from './alerts.dto';

export class CreateFileDto {
  readonly alert?: AlertDto | null;
  readonly startSecond?: number;
  readonly output: string;
  readonly duration: number;
}

export class FileDto {
  startSeconds: number;
  duration: number;
}
