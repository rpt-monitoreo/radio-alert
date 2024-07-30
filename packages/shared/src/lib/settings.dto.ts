/* import { IsString, Matches } from 'class-validator';
 */
export enum Day {
  Weekday = 'weekday',
  Sunday = 'sunday',
  Saturday = 'saturday',
}

export class Slot {
  readonly day?: Day;

  /*   @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'start must be in HH:mm format' }) */
  readonly start?: string;

  /*  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'end must be in HH:mm format' }) */
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
