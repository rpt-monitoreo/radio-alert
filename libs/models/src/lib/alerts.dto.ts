export class AlertDto {
  readonly date: Date;
  readonly text: string;
  readonly word: string;
  readonly platform: string;
  readonly time: string;
  readonly client: string;
  readonly madia: string;
}

export class GetAlertsDto {
  readonly startDate: string;
  readonly endDate: string;
  readonly madia?: string;
  readonly clientName?: string;
}
