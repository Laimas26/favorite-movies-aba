import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  setPage,
  setSearch,
  setSortBy,
} from '../../store/slices/moviesSlice';
import MovieTable from '../../components/MovieTable/MovieTable';
import MovieForm from '../../components/MovieForm/MovieForm';
import type { MovieFormData } from '../../components/MovieForm/MovieForm';
import SearchBar from '../../components/SearchBar/SearchBar';
import Pagination from '../../components/Pagination/Pagination';
import AddMovieButton from '../../components/AddMovieButton/AddMovieButton';
import type { Movie } from '../../types';
import styles from './Movies.module.css';

export default function Movies() {
  const dispatch = useAppDispatch();
  const { movies, page, totalPages, total, search, sortBy, sortOrder, loading } =
    useAppSelector((state) => state.movies);
  const { user } = useAppSelector((state) => state.auth);

  const [showForm, setShowForm] = useState(false);

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.authGate}>
          <div className={styles.authGateIcon}>🎬</div>
          <h2>Hold on!</h2>
          <p>You need to log in to see my fabulous movie list.</p>
          <Link to="/login" className={styles.authGateBtn}>
            Log in
          </Link>
        </div>
      </div>
    );
  }
  const [editingMovie, setEditingMovie] = useState<Movie | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMovies({ page, search, sortBy, sortOrder }));
  }, [dispatch, page, search, sortBy, sortOrder]);

  const handleSearch = useCallback(
    (value: string) => {
      dispatch(setSearch(value));
    },
    [dispatch],
  );

  const handleSort = useCallback(
    (column: string) => {
      dispatch(setSortBy(column));
    },
    [dispatch],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch],
  );

  const handleAddClick = () => {
    setEditingMovie(undefined);
    setFormError(null);
    setShowForm(true);
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setFormError(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      await dispatch(deleteMovie(id));
      dispatch(fetchMovies({ page, search, sortBy, sortOrder }));
    }
  };

  const handleFormSubmit = async (data: MovieFormData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editingMovie) {
        const result = await dispatch(updateMovie({ id: editingMovie.id, ...data, imageFile: data.imageFile }));
        if (updateMovie.rejected.match(result)) {
          setFormError(result.payload as string);
          setFormLoading(false);
          return;
        }
      } else {
        const { imageFile, ...movieData } = data;
        const result = await dispatch(addMovie({ ...movieData, imageFile }));
        if (addMovie.rejected.match(result)) {
          setFormError(result.payload as string);
          setFormLoading(false);
          return;
        }
      }
      setShowForm(false);
      dispatch(fetchMovies({ page, search, sortBy, sortOrder }));
    } catch {
      setFormError('An unexpected error occurred');
    }
    setFormLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Favorite Movies</h1>
            <p className={styles.subtitle}>
              A curated list of the best films ever made (according to me)
            </p>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <SearchBar value={search} onChange={handleSearch} />
        <AddMovieButton onClick={handleAddClick} />
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading movies...</p>
        </div>
      ) : (
        <>
          <MovieTable
            movies={movies}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentUserId={user?.id ?? null}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          {total > 0 && (
            <p className={styles.totalInfo}>
              {total} movie{total !== 1 ? 's' : ''} total
            </p>
          )}
        </>
      )}

      {showForm && (
        <MovieForm
          movie={editingMovie}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
          loading={formLoading}
          error={formError}
        />
      )}
    </div>
  );
}
