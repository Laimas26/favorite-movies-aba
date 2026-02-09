import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Movie } from '../../movies/entities/movie.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  @Exclude()
  resetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  resetTokenExpiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Movie, (movie) => movie.user)
  movies: Movie[];
}
