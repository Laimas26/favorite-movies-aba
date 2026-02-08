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
  setYearRange,
  setFilterGenres,
  setRatingRange,
  resetFilters,
} from '../../store/slices/moviesSlice';
import MovieTable from '../../components/MovieTable/MovieTable';
import MovieForm from '../../components/MovieForm/MovieForm';
import type { MovieFormData } from '../../components/MovieForm/MovieForm';
import SearchBar from '../../components/SearchBar/SearchBar';
import Pagination from '../../components/Pagination/Pagination';
import AddMovieButton from '../../components/AddMovieButton/AddMovieButton';
import YearRangeSlider from '../../components/YearRangeSlider/YearRangeSlider';
import GenreFilter from '../../components/GenreFilter/GenreFilter';
import type { Movie } from '../../types';
import catDirector from '../../assets/cat-director.png';
import styles from './Movies.module.css';

export default function Movies() {
  const dispatch = useAppDispatch();
  const { movies, page, totalPages, total, search, sortBy, sortOrder, yearFrom, yearTo, filterGenres, ratingMin, ratingMax, loading } =
    useAppSelector((state) => state.movies);
  const { user } = useAppSelector((state) => state.auth);

  const [showForm, setShowForm] = useState(false);

  // Local draft state for filters (only dispatched on "Apply")
  const [localYearFrom, setLocalYearFrom] = useState(yearFrom ?? 1900);
  const [localYearTo, setLocalYearTo] = useState(yearTo ?? 2026);
  const [localRatingMin, setLocalRatingMin] = useState(ratingMin ?? 0);
  const [localRatingMax, setLocalRatingMax] = useState(ratingMax ?? 10);
  const [localGenres, setLocalGenres] = useState<string[]>(filterGenres);

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.authGate}>
          <div className={styles.authGateIcon}>&#127916;</div>
          <h2>Hold on!</h2>
          <p>You need to log in to see my fabulous movie list.</p>
          <Link to="/login" className={styles.authGateBtn}>
            Log in
          </Link>
          <img
            src={catDirector}
            alt="Cat director pointing at login"
            className={styles.catImage}
          />
        </div>
      </div>
    );
  }
  const [editingMovie, setEditingMovie] = useState<Movie | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchParams = {
    page, search, sortBy, sortOrder, yearFrom, yearTo, ratingMin, ratingMax,
    ...(filterGenres.length > 0 && { genres: filterGenres.join(',') }),
  };

  useEffect(() => {
    dispatch(fetchMovies(fetchParams));
  }, [dispatch, page, search, sortBy, sortOrder, yearFrom, yearTo, filterGenres, ratingMin, ratingMax]);

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

  const handleYearRange = useCallback(
    (from: number, to: number) => {
      setLocalYearFrom(from);
      setLocalYearTo(to);
    },
    [],
  );

  const handleGenreFilter = useCallback(
    (genres: string[]) => {
      setLocalGenres(genres);
    },
    [],
  );

  const handleRatingRange = useCallback(
    (from: number, to: number) => {
      setLocalRatingMin(from);
      setLocalRatingMax(to);
    },
    [],
  );

  const handleApplyFilters = useCallback(() => {
    dispatch(setYearRange({ yearFrom: localYearFrom === 1900 ? undefined : localYearFrom, yearTo: localYearTo === 2026 ? undefined : localYearTo }));
    dispatch(setFilterGenres(localGenres));
    dispatch(setRatingRange({ ratingMin: localRatingMin === 0 ? undefined : localRatingMin, ratingMax: localRatingMax === 10 ? undefined : localRatingMax }));
  }, [dispatch, localYearFrom, localYearTo, localGenres, localRatingMin, localRatingMax]);

  const handleResetFilters = useCallback(() => {
    setLocalYearFrom(1900);
    setLocalYearTo(2026);
    setLocalRatingMin(0);
    setLocalRatingMax(10);
    setLocalGenres([]);
    dispatch(resetFilters());
  }, [dispatch]);

  const hasActiveFilters = yearFrom !== undefined || yearTo !== undefined || filterGenres.length > 0 || ratingMin !== undefined || ratingMax !== undefined;
  const hasDraftChanges = localYearFrom !== (yearFrom ?? 1900) || localYearTo !== (yearTo ?? 2026) || localRatingMin !== (ratingMin ?? 0) || localRatingMax !== (ratingMax ?? 10) || JSON.stringify(localGenres) !== JSON.stringify(filterGenres);

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
      dispatch(fetchMovies(fetchParams));
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
      dispatch(fetchMovies(fetchParams));
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

      <div className={styles.filtersSection}>
        <div className={styles.filtersHeader}>
          <span className={styles.filtersTitle}>Filters</span>
          <div className={styles.filterActions}>
            {hasDraftChanges && (
              <button className={styles.applyBtn} onClick={handleApplyFilters} type="button">
                Apply filters
              </button>
            )}
            {hasActiveFilters && (
              <button className={styles.resetBtn} onClick={handleResetFilters} type="button">
                Reset filters
              </button>
            )}
          </div>
        </div>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Year</span>
          <YearRangeSlider
            min={1900}
            max={2026}
            valueFrom={localYearFrom}
            valueTo={localYearTo}
            onChange={handleYearRange}
          />
        </div>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Rating</span>
          <YearRangeSlider
            min={0}
            max={10}
            step={0.5}
            valueFrom={localRatingMin}
            valueTo={localRatingMax}
            onChange={handleRatingRange}
          />
        </div>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Genre</span>
          <GenreFilter selected={localGenres} onChange={handleGenreFilter} />
        </div>
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
