/* import { IsString, Matches } from 'class-validator';
 */
export enum Day {
  Weekday = 'weekday',
  Sunday = 'sunday',
  Saturday = 'saturday',
}

export class Slot {
  day: Day;

  /*   @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'start must be in HH:mm format' }) */
  start: string;

  /*  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'end must be in HH:mm format' }) */
  end: string;

  label: string;
  audioLabel: string;
}

export class PlatformDto {
  id: string;
  name?: string;
  url?: string;
  media?: string;
  slots?: Slot[];
}
