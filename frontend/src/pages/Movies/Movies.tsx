import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  setPage,
  setLimit,
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
  const { movies, page, limit, totalPages, total, search, sortBy, sortOrder, yearFrom, yearTo, filterGenres, ratingMin, ratingMax, loading } =
    useAppSelector((state) => state.movies);
  const { user } = useAppSelector((state) => state.auth);

  const [showForm, setShowForm] = useState(false);

  // Local draft state for filters (only dispatched on "Apply")
  const [localYearFrom, setLocalYearFrom] = useState(yearFrom ?? 1900);
  const [localYearTo, setLocalYearTo] = useState(yearTo ?? 2026);
  const [localRatingMin, setLocalRatingMin] = useState(ratingMin ?? 0);
  const [localRatingMax, setLocalRatingMax] = useState(ratingMax ?? 10);
  const [localGenres, setLocalGenres] = useState<string[]>(filterGenres);
  const [editingMovie, setEditingMovie] = useState<Movie | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const aboutCardRef = useRef<HTMLDivElement>(null);

  if (!user) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authGate}>
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

  const fetchParams = {
    page, limit, search, sortBy, sortOrder, yearFrom, yearTo, ratingMin, ratingMax,
    ...(filterGenres.length > 0 && { genres: filterGenres.join(',') }),
  };

  useEffect(() => {
    dispatch(fetchMovies(fetchParams));
  }, [dispatch, page, limit, search, sortBy, sortOrder, yearFrom, yearTo, filterGenres, ratingMin, ratingMax]);

  useEffect(() => {
    const el = aboutCardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setAboutVisible(entry.isIntersecting); },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      dispatch(setLimit(newLimit));
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
    <>
      <section className={styles.hero}>
        <video className={styles.heroVideo} autoPlay muted loop playsInline>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Favorite Movies</h1>
          <p className={styles.heroSubtitle}>
            A curated list of the best films ever made (according to me)
          </p>
        </div>
      </section>

      <div className={styles.page}>
      <div id="my-list" className={styles.toolbar}>
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
          {total > 0 && (
            <div className={styles.tableHeader}>
              <span className={styles.totalInfo}>
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} out of {total}
              </span>
              <select
                className={styles.perPage}
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          )}
          <MovieTable
            movies={movies}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentUserId={user?.id ?? null}
            showActions={user?.email === 'laimonas.rupeika@gmail.com'}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <section id="about" className={styles.newSection}>
        <div ref={aboutCardRef} className={`${styles.aboutCard} ${aboutVisible ? styles.aboutCardVisible : ''}`}>
          <h2 className={styles.aboutTitle}>What's this all about?</h2>
          <p className={styles.aboutSubtitle}>
            A personal movie tracker where I keep a curated list of my all-time
            favorite films. Add movies, rate them, leave notes, and organize
            my cinematic journey.
          </p>
          <div className={styles.aboutFeatures}>
            <div className={styles.aboutFeature}>
              <span className={styles.aboutIcon}>&#127916;</span>
              <h3>Track Movies</h3>
              <p>Keep a personal list of favorite films with posters.</p>
            </div>
            <div className={styles.aboutFeature}>
              <span className={styles.aboutIcon}>&#11088;</span>
              <h3>Rate &amp; Review</h3>
              <p>Rate movies and add notes to remember why you loved them.</p>
            </div>
            <div className={styles.aboutFeature}>
              <span className={styles.aboutIcon}>&#128269;</span>
              <h3>Search &amp; Sort</h3>
              <p>Quickly find any movie with search, sort by title, year, or rating.</p>
            </div>
          </div>
          <div className={styles.aboutTech}>
            <h3 className={styles.aboutTechTitle}>Built with</h3>
            <div className={styles.aboutTechList}>
              <span className={styles.aboutTechBadge}>React</span>
              <span className={styles.aboutTechBadge}>TypeScript</span>
              <span className={styles.aboutTechBadge}>NestJS</span>
              <span className={styles.aboutTechBadge}>PostgreSQL</span>
              <span className={styles.aboutTechBadge}>Redux Toolkit</span>
              <span className={styles.aboutTechBadge}>CSS Modules</span>
            </div>
          </div>
        </div>
      </section>

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
    </>
  );
}
