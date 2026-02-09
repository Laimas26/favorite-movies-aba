import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(
    email: string,
    password: string,
    name: string,
  ): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
    });
    return this.usersRepository.save(user);
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) return false;
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await this.usersRepository.save(user);
    return true;
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      resetToken: token,
      resetTokenExpiry: MoreThan(new Date()),
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(userId, {
      password: hashedPassword,
      resetToken: null as any,
      resetTokenExpiry: null as any,
    });
  }

  async findOrCreateByGoogle(
    googleId: string,
    email: string,
    name: string,
  ): Promise<User> {
    let user = await this.usersRepository.findOneBy({ googleId });
    if (user) return user;

    user = await this.findByEmail(email);
    if (user) {
      user.googleId = googleId;
      return this.usersRepository.save(user);
    }

    user = this.usersRepository.create({ googleId, email, name });
    return this.usersRepository.save(user);
  }
}
