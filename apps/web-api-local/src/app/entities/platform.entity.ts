import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { IsEnum } from 'class-validator';
import { Day, Slot } from '@radio-alert/models';

@Entity()
export class Platform {
  @ObjectIdColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  media: string;

  @Column()
  @IsEnum(Day, { each: true, message: 'Day must be one of the following values: weekday, sunday, saturday' })
  slots: Slot[];
}
