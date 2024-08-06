export enum Day {
  Weekday = "weekday",
  Sunday = "sunday",
  Saturday = "saturday",
}

export class Slot {
  readonly day?: Day;

  readonly start?: string;

  readonly end?: string;

  readonly label?: string;
  readonly audioLabel?: string;
}

export class PlatformDto {
  readonly id?: string;
  readonly name?: string;
  readonly url?: string;
  readonly media?: string;
  readonly slots?: Slot[];
}
