import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Movie, PaginatedResponse, QueryParams } from '../../types';
import api from '../../api/axios';

interface MoviesState {
  movies: Movie[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  yearFrom: number | undefined;
  yearTo: number | undefined;
  filterGenres: string[];
  ratingMin: number | undefined;
  ratingMax: number | undefined;
  loading: boolean;
  error: string | null;
  currentMovie: Movie | null;
  currentMovieLoading: boolean;
  currentMovieError: string | null;
}

const initialState: MoviesState = {
  movies: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  search: '',
  sortBy: 'rating',
  sortOrder: 'DESC',
  yearFrom: undefined,
  yearTo: undefined,
  filterGenres: [],
  ratingMin: undefined,
  ratingMax: undefined,
  loading: false,
  error: null,
  currentMovie: null,
  currentMovieLoading: false,
  currentMovieError: null,
};

export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (params: QueryParams) => {
    const response = await api.get('/movies', { params });
    return response.data as PaginatedResponse<Movie>;
  },
);

interface AddMoviePayload {
  title: string;
  year: number;
  genres: string[];
  director: string;
  rating: number;
  notes?: string;
  imageFile?: File;
}

export const addMovie = createAsyncThunk(
  'movies/addMovie',
  async (data: AddMoviePayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('year', String(data.year));
      formData.append('genres', JSON.stringify(data.genres));
      formData.append('director', data.director);
      formData.append('rating', String(data.rating));
      if (data.notes) formData.append('notes', data.notes);
      if (data.imageFile) formData.append('image', data.imageFile);
      const response = await api.post('/movies', formData);
      return response.data as Movie;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to add movie');
    }
  },
);

interface UpdateMoviePayload {
  id: string;
  title?: string;
  year?: number;
  genres?: string[];
  director?: string;
  rating?: number;
  notes?: string;
  imageFile?: File;
}

export const updateMovie = createAsyncThunk(
  'movies/updateMovie',
  async ({ id, imageFile, ...data }: UpdateMoviePayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          formData.append(key, key === 'genres' ? JSON.stringify(value) : String(value));
        }
      }
      if (imageFile) formData.append('image', imageFile);
      const response = await api.patch(`/movies/${id}`, formData);
      return response.data as Movie;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update movie');
    }
  },
);

export const fetchMovieById = createAsyncThunk(
  'movies/fetchMovieById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/movies/${id}`);
      return response.data as Movie;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Movie not found');
    }
  },
);

export const deleteMovie = createAsyncThunk(
  'movies/deleteMovie',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/movies/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete movie');
    }
  },
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setSortBy(state, action: PayloadAction<string>) {
      if (state.sortBy === action.payload) {
        state.sortOrder = state.sortOrder === 'ASC' ? 'DESC' : 'ASC';
      } else {
        state.sortBy = action.payload;
        state.sortOrder = 'ASC';
      }
      state.page = 1;
    },
    setYearRange(state, action: PayloadAction<{ yearFrom?: number; yearTo?: number }>) {
      state.yearFrom = action.payload.yearFrom;
      state.yearTo = action.payload.yearTo;
      state.page = 1;
    },
    setFilterGenres(state, action: PayloadAction<string[]>) {
      state.filterGenres = action.payload;
      state.page = 1;
    },
    setRatingRange(state, action: PayloadAction<{ ratingMin?: number; ratingMax?: number }>) {
      state.ratingMin = action.payload.ratingMin;
      state.ratingMax = action.payload.ratingMax;
      state.page = 1;
    },
    resetFilters(state) {
      state.yearFrom = undefined;
      state.yearTo = undefined;
      state.filterGenres = [];
      state.ratingMin = undefined;
      state.ratingMax = undefined;
      state.page = 1;
    },
    clearCurrentMovie(state) {
      state.currentMovie = null;
      state.currentMovieError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch movies';
      })
      .addCase(addMovie.fulfilled, (state, action) => {
        state.movies.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateMovie.fulfilled, (state, action) => {
        const index = state.movies.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.movies[index] = action.payload;
        }
      })
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.movies = state.movies.filter((m) => m.id !== action.payload);
        state.total -= 1;
      })
      .addCase(fetchMovieById.pending, (state) => {
        state.currentMovieLoading = true;
        state.currentMovieError = null;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.currentMovieLoading = false;
        state.currentMovie = action.payload;
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.currentMovieLoading = false;
        state.currentMovieError = action.payload as string;
      });
  },
});

export const { setPage, setLimit, setSearch, setSortBy, setYearRange, setFilterGenres, setRatingRange, resetFilters, clearCurrentMovie } = moviesSlice.actions;
export default moviesSlice.reducer;
