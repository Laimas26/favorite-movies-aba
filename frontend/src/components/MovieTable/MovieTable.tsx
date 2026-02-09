import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../../types';
import GenreTag from '../GenreTag/GenreTag';
import catStretch from '../../assets/cat-stretch.png';
import styles from './MovieTable.module.css';

interface Props {
  movies: Movie[];
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  onSort: (column: string) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
  currentUserId: string | null;
  showActions: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'year', label: 'Year' },
  { key: 'genres', label: 'Genre' },
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
  showActions,
}: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => {
            const isExpanded = expandedRows.has(movie.id);
            const colCount = COLUMNS.length + (showActions ? 1 : 0);

            return (
              <React.Fragment key={movie.id}>
                <tr
                  className={isExpanded ? styles.expandedParent : ''}
                  onClick={() => toggleRow(movie.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className={styles.titleCell}>
                      <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
                        &#9656;
                      </span>
                      {movie.image && (
                        <img
                          className={styles.thumbnail}
                          src={`${API_URL}/uploads/${movie.image}`}
                          alt={movie.title}
                        />
                      )}
                      <div>
                        <Link
                          to={`/movies/${movie.id}`}
                          className={styles.titleLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {movie.title}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td>{movie.year}</td>
                  <td>
                    <div className={styles.genreCell}>
                      {movie.genres[0] && <GenreTag genre={movie.genres[0]} isMain />}
                      {movie.genres.length > 1 && (
                        <span className={styles.genreCount}>+{movie.genres.length - 1}</span>
                      )}
                    </div>
                  </td>
                  <td>{movie.director}</td>
                  <td className={styles.rating}><span className={styles.ratingStar}>&#9733;</span> {Number(movie.rating) % 1 === 0 ? Math.round(Number(movie.rating)) : movie.rating}/10</td>
                  {showActions && (
                    <td>
                      {movie.userId === currentUserId && (
                        <div className={styles.actions}>
                          <button
                            className={styles.editBtn}
                            onClick={(e) => { e.stopPropagation(); onEdit(movie); }}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={(e) => { e.stopPropagation(); onDelete(movie.id); }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
                <tr className={`${styles.expandedRow} ${isExpanded ? styles.expandedRowOpen : ''}`}>
                  <td colSpan={colCount}>
                    <img
                      src={catStretch}
                      alt=""
                      className={`${styles.stretchCat} ${isExpanded ? styles.stretchCatOpen : ''}`}
                    />
                    <div className={`${styles.expandedWrapper} ${isExpanded ? styles.expandedWrapperOpen : ''}`}>
                      <div className={styles.expandedInner}>
                        <div className={styles.expandedContent}>
                          <div className={styles.expandedSection}>
                            <span className={styles.expandedLabel}>Genres</span>
                            <div className={styles.genreTags}>
                              {movie.genres.map((g, i) => (
                                <GenreTag key={g} genre={g} isMain={i === 0} />
                              ))}
                            </div>
                          </div>
                          {movie.notes && (
                            <div className={styles.expandedSection}>
                              <span className={styles.expandedLabel}>Notes</span>
                              <p className={styles.expandedNotes}>{movie.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
