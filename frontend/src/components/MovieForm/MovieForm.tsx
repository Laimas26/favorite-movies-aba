import { useState } from 'react';
import type { Movie } from '../../types';
import styles from './MovieForm.module.css';

interface Props {
  movie?: Movie;
  onSubmit: (data: MovieFormData) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

export interface MovieFormData {
  title: string;
  year: number;
  genre: string;
  director: string;
  rating: number;
  notes?: string;
}

export default function MovieForm({ movie, onSubmit, onClose, loading, error }: Props) {
  const [title, setTitle] = useState(movie?.title ?? '');
  const [year, setYear] = useState(movie?.year ?? new Date().getFullYear());
  const [genre, setGenre] = useState(movie?.genre ?? '');
  const [director, setDirector] = useState(movie?.director ?? '');
  const [rating, setRating] = useState(movie?.rating ?? 7);
  const [notes, setNotes] = useState(movie?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, year, genre, director, rating, notes: notes || undefined });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {movie ? 'Edit Movie' : 'Add Movie'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. The Shawshank Redemption"
            />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Year</label>
              <input
                className={styles.input}
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1888}
                max={2030}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Rating (1-10)</label>
              <input
                className={styles.input}
                type="number"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min={1}
                max={10}
                step={0.5}
                required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Genre</label>
            <input
              className={styles.input}
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
              placeholder="e.g. Drama"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Director</label>
            <input
              className={styles.input}
              type="text"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              required
              placeholder="e.g. Frank Darabont"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Notes (optional)</label>
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your thoughts about this movie..."
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : movie ? 'Update' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
