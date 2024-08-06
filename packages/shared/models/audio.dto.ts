import moment from 'moment';
import { AlertDto } from './alerts.dto';

export class CreateFileDto {
  readonly alert?: AlertDto | null;
  readonly startSecond?: number;
  readonly output?: string;
  readonly duration?: number;
}

export interface FileDto {
  readonly startSeconds: number;
  readonly duration: number;
}

export class Fragment {
  readonly startTime?: Date;
  readonly duration?: moment.Duration;
}
