import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Alert {
  @ObjectIdColumn()
  id!: string;

  @Column()
  text!: string;

  @CreateDateColumn()
  date!: Date;

  @CreateDateColumn()
  startTime!: Date;

  @CreateDateColumn()
  endTime!: Date;

  @Column()
  column!: string;

  @Column()
  media!: string;

  @Column()
  words!: string[];

  @Column()
  filePath!: string;

  @Column()
  platform!: string;

  @Column()
  clientName!: string;

  @Column()
  type!: string;
}
