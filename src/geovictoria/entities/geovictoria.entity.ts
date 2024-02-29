import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Geovictoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  propiedad1: string;

  @Column()
  propiedad2: number;
}
