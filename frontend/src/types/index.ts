export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  director: string;
  rating: number;
  notes: string | null;
  image: string | null;
  createdAt: string;
  userId: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  yearFrom?: number;
  yearTo?: number;
  genres?: string;
  ratingMin?: number;
  ratingMax?: number;
}
