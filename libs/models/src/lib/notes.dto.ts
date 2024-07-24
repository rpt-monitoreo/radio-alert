import moment from 'moment';

export class NoteDto {
  readonly id?: string;
  readonly text?: string;
  readonly summary?: string;
  readonly title?: string;
  readonly index?: string;
  readonly program?: string;
  readonly media?: string;
  readonly platform?: string;
  readonly clientName?: string;
  readonly startTime?: Date;
  readonly duration?: moment.Duration;
}
