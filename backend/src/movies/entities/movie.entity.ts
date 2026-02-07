import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  year: number;

  @Column('jsonb', { default: [] })
  genres: string[];

  @Column()
  director: string;

  @Column('decimal', { precision: 3, scale: 1 })
  rating: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.movies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
