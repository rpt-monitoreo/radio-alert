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
  readonly type?: string;
}

export class GetTranscriptionDto {
  readonly filename: string;
  readonly words: string[];
}

export class ValidDatesDto {
  readonly minDate: string;
  readonly maxDate: string;
}

export interface GetSummaryDto {
  text: string;
}

export type DateRange = [Dayjs | null, Dayjs | null];

export const dateFormat = 'YYYY-MM-DD';
