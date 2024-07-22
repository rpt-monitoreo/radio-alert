import { Dayjs } from 'dayjs';

export class AlertDto {
  readonly id: string;
  readonly text: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly media: string;
  readonly words: string[];
  readonly filePath: string;
  readonly platform: string;
  readonly clientName: string;
  readonly type: string;
}

export class GetAlertsDto {
  readonly startDate?: string;
  readonly endDate?: string;
  readonly madia?: string;
  readonly clientName?: string;
  readonly platform?: string;
  readonly type?: string[];
}

export class GetTranscriptionDto {
  readonly filename: string;
}
export class TranscriptionDto {
  readonly noteId: string;
  readonly text: string;
}
export class ValidDatesDto {
  readonly minDate: string;
  readonly maxDate: string;
}

export class GetSummaryDto {
  readonly noteId: string;
  readonly text: string;
  readonly words: string[];
}

export class SummaryDto {
  readonly title: string;
  readonly summary: string;
}

export type DateRange = [Dayjs | null, Dayjs | null];

export const dateFormat = 'YYYY-MM-DD';
