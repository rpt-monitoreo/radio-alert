import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export class Alertas {
  @ObjectIdColumn()
  id: string;

  @Column()
  date: Date;

  @Column()
  texto: string;

  @Column()
  palabra: string;

  @Column()
  emisora: string;

  @Column()
  tiempo: string;
}
