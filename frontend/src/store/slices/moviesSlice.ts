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
  loading: boolean;
  error: string | null;
}

const initialState: MoviesState = {
  movies: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'DESC',
  loading: false,
  error: null,
};

export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (params: QueryParams) => {
    const response = await api.get('/movies', { params });
    return response.data as PaginatedResponse<Movie>;
  },
);

export const addMovie = createAsyncThunk(
  'movies/addMovie',
  async (data: Omit<Movie, 'id' | 'createdAt' | 'userId' | 'user'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/movies', data);
      return response.data as Movie;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to add movie');
    }
  },
);

export const updateMovie = createAsyncThunk(
  'movies/updateMovie',
  async ({ id, ...data }: Partial<Movie> & { id: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/movies/${id}`, data);
      return response.data as Movie;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update movie');
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
      });
  },
});

export const { setPage, setSearch, setSortBy } = moviesSlice.actions;
export default moviesSlice.reducer;
