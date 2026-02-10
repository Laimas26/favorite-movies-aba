import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMovieById, clearCurrentMovie, deleteMovie, updateMovie } from '../../store/slices/moviesSlice';
import MovieForm from '../../components/MovieForm/MovieForm';
import type { MovieFormData } from '../../components/MovieForm/MovieForm';
import GenreTag from '../../components/GenreTag/GenreTag';
import { ADMIN_EMAILS } from '../../constants';
import styles from './MovieDetail.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentMovie: movie, currentMovieLoading: loading, currentMovieError: error } =
    useAppSelector((state) => state.movies);
  const { user } = useAppSelector((state) => state.auth);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchMovieById(id));
    return () => { dispatch(clearCurrentMovie()); };
  }, [dispatch, id]);

  const isOwner = user && movie && (movie.userId === user.id || ADMIN_EMAILS.includes(user.email));

  const handleDelete = async () => {
    if (movie && window.confirm('Are you sure you want to delete this movie?')) {
      await dispatch(deleteMovie(movie.id));
      navigate('/');
    }
  };

  const handleEdit = async (data: MovieFormData) => {
    if (!movie) return;
    await dispatch(updateMovie({ id: movie.id, ...data }));
    setShowEditForm(false);
    dispatch(fetchMovieById(movie.id));
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>{error}</p>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            &larr; Back to list
          </button>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        &larr; Back to list
      </button>

      <div className={styles.card}>
        {movie.image && (
          <div className={styles.posterWrapper}>
            <img
              className={styles.poster}
              src={`${API_URL}/uploads/${movie.image}`}
              alt={movie.title}
            />
          </div>
        )}
        <div className={styles.info}>
          <h1 className={styles.title}>{movie.title}</h1>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Year</span>
              <span className={styles.metaValue}>{movie.year}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Genre</span>
              <div className={styles.genreTags}>
                {movie.genres.map((g, i) => (
                  <GenreTag key={g} genre={g} isMain={i === 0} size="md" />
                ))}
              </div>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Director</span>
              <span className={styles.metaValue}>{movie.director}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Rating</span>
              <span className={styles.rating}>{movie.rating}/10</span>
            </div>
          </div>

          {movie.notes && (
            <div className={styles.notes}>
              <h3 className={styles.notesLabel}>Notes</h3>
              <p>{movie.notes}</p>
            </div>
          )}

          {isOwner && (
            <div className={styles.actions}>
              <button className={styles.editBtn} onClick={() => setShowEditForm(true)}>
                Edit
              </button>
              <button className={styles.deleteBtn} onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {showEditForm && (
        <MovieForm
          movie={movie}
          onSubmit={handleEdit}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
