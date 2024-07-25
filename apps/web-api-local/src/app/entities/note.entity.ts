import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export class Note {
  @ObjectIdColumn()
  id: string;

  @Column()
  text: string;

  @Column()
  summary: string;

  @Column()
  title: string;

  @Column()
  index: string;

  @Column()
  program: string;

  @Column()
  startTime: string;

  @Column()
  duration: number;

  @Column()
  alert_id: string;

  @Column()
  audioLabel: string;
}
