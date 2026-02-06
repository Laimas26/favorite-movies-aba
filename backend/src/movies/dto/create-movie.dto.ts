import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @Type(() => Number)
  @IsInt()
  @Min(1888)
  @Max(2030)
  year: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  genre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  director: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
