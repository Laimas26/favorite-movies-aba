import type { Movie } from '../../types';
import styles from './MovieTable.module.css';

interface Props {
  movies: Movie[];
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  onSort: (column: string) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
  currentUserId: string | null;
}

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'year', label: 'Year' },
  { key: 'genre', label: 'Genre' },
  { key: 'director', label: 'Director' },
  { key: 'rating', label: 'Rating' },
];

export default function MovieTable({
  movies,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  currentUserId,
}: Props) {
  if (movies.length === 0) {
    return (
      <div className={styles.empty}>
        <div style={{ fontSize: '2.5rem' }}>&#127916;</div>
        <p>No movies found. Add some favorites!</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className={sortBy === col.key ? styles.activeSort : ''}
              >
                {col.label}
                {sortBy === col.key && (
                  <span className={styles.sortArrow}>
                    {sortOrder === 'ASC' ? '\u2191' : '\u2193'}
                  </span>
                )}
              </th>
            ))}
            {currentUserId && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id}>
              <td>
                <strong>{movie.title}</strong>
                {movie.notes && (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {movie.notes}
                  </div>
                )}
              </td>
              <td>{movie.year}</td>
              <td>{movie.genre}</td>
              <td>{movie.director}</td>
              <td className={styles.rating}>{movie.rating}/10</td>
              {currentUserId && (
                <td>
                  {movie.userId === currentUserId && (
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => onEdit(movie)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => onDelete(movie.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
