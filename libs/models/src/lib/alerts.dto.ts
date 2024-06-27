export class AlertDto {
  readonly id: string;
  readonly text: string;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly madia: string;
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
}

export class ValidDatesDto {
  readonly minDate: string;
  readonly maxDate: string;
}
