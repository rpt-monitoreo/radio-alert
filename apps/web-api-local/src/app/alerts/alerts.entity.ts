import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Alert {
  @ObjectIdColumn()
  id: string;

  @CreateDateColumn()
  date: Date;

  @Column()
  text: string;

  @Column()
  word: string;

  @Column()
  station: string;

  @Column()
  time: string;

  @Column()
  client: string;
}
