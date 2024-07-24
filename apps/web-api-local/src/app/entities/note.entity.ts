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
  alert_id: string;
}
