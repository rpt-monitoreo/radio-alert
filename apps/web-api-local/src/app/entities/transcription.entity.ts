import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Transcription {
  @ObjectIdColumn()
  id: string;

  @Column()
  text: string;

  @CreateDateColumn()
  startTime: Date;

  @CreateDateColumn()
  endTime: Date;

  @Column()
  media: string;

  @Column()
  filePath: string;

  @Column()
  platform: string;

  @Column()
  processed: boolean;
}
