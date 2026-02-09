import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Movie } from './entities/movie.entity.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { QueryMoviesDto } from './dto/query-movies.dto.js';

@Injectable()
export class MoviesService implements OnModuleInit {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async onModuleInit() {
    // One-time migration: convert old `genre` string column to `genres` jsonb
    try {
      const hasOldColumn = await this.moviesRepository.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'genre'`,
      );
      if (hasOldColumn.length > 0) {
        await this.moviesRepository.query(
          `UPDATE movies SET genres = jsonb_build_array(genre) WHERE genres = '[]'::jsonb AND genre IS NOT NULL AND genre != ''`,
        );
        await this.moviesRepository.query(
          `ALTER TABLE movies DROP COLUMN IF EXISTS genre`,
        );
        this.logger.log('Migrated genre → genres column');
      }
    } catch {
      // Column may not exist yet on first run
    }
  }

  async findAll(query: QueryMoviesDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC', yearFrom, yearTo, genres, ratingMin, ratingMax, haveCats } = query;

    const qb = this.moviesRepository
      .createQueryBuilder('movie')
      .leftJoin('movie.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.email']);

    if (search) {
      qb.where('LOWER(movie.title) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (yearFrom) {
      qb.andWhere('movie.year >= :yearFrom', { yearFrom });
    }
    if (yearTo) {
      qb.andWhere('movie.year <= :yearTo', { yearTo });
    }

    if (genres) {
      const genreList = genres.split(',').map((g) => g.trim()).filter(Boolean);
      if (genreList.length > 0) {
        qb.andWhere(`movie.genres ::jsonb ?| array[:...genreList]`, { genreList });
      }
    }

    if (ratingMin !== undefined) {
      qb.andWhere('movie.rating >= :ratingMin', { ratingMin });
    }
    if (ratingMax !== undefined) {
      qb.andWhere('movie.rating <= :ratingMax', { ratingMax });
    }

    if (haveCats !== undefined) {
      qb.andWhere('movie.haveCats = :haveCats', { haveCats });
    }

    if (sortBy === 'genres') {
      qb.orderBy(`movie.genres->>0`, sortOrder);
    } else {
      qb.orderBy(`movie.${sortBy}`, sortOrder);
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  async create(dto: CreateMovieDto, userId: string, imageFilename?: string) {
    const movie = this.moviesRepository.create({
      ...dto,
      userId,
      ...(imageFilename && { image: imageFilename }),
    });
    return this.moviesRepository.save(movie);
  }

  async update(id: string, dto: UpdateMovieDto, userId: string, imageFilename?: string) {
    const movie = await this.moviesRepository.findOneBy({ id });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    if (movie.userId !== userId) {
      throw new ForbiddenException('You can only edit your own movies');
    }
    if (imageFilename) {
      if (movie.image) {
        this.deleteImageFile(movie.image);
      }
      movie.image = imageFilename;
    }
    Object.assign(movie, dto);
    return this.moviesRepository.save(movie);
  }

  async remove(id: string, userId: string) {
    const movie = await this.moviesRepository.findOneBy({ id });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    if (movie.userId !== userId) {
      throw new ForbiddenException('You can only delete your own movies');
    }
    if (movie.image) {
      this.deleteImageFile(movie.image);
    }
    await this.moviesRepository.remove(movie);
    return { message: 'Movie deleted successfully' };
  }

  private deleteImageFile(filename: string) {
    const filePath = join(process.cwd(), 'uploads', filename);
    unlink(filePath).catch(() => {});
  }
}
