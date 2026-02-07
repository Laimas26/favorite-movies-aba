import { useState } from 'react';
import { PREDEFINED_GENRES } from '../../constants/genres';
import styles from './GenreTagPicker.module.css';

interface Props {
  selectedGenres: string[];
  onChange: (genres: string[]) => void;
}

export default function GenreTagPicker({ selectedGenres, onChange }: Props) {
  const [customGenre, setCustomGenre] = useState('');

  const toggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onChange(selectedGenres.filter((g) => g !== genre));
    } else {
      onChange([...selectedGenres, genre]);
    }
  };

  const remove = (genre: string) => {
    onChange(selectedGenres.filter((g) => g !== genre));
  };

  const setAsMain = (genre: string) => {
    const rest = selectedGenres.filter((g) => g !== genre);
    onChange([genre, ...rest]);
  };

  const addCustom = () => {
    const trimmed = customGenre.trim();
    if (
      trimmed &&
      !selectedGenres.some((g) => g.toLowerCase() === trimmed.toLowerCase())
    ) {
      onChange([...selectedGenres, trimmed]);
      setCustomGenre('');
    }
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
  };

  return (
    <div>
      {selectedGenres.length > 0 && (
        <div className={styles.selectedArea}>
          {selectedGenres.map((genre, i) => (
            <span
              key={genre}
              className={`${styles.selectedTag} ${i === 0 ? styles.main : ''}`}
              onClick={() => setAsMain(genre)}
              title={i === 0 ? 'Main genre' : 'Click to set as main'}
            >
              {i === 0 && <span className={styles.mainIndicator}>★</span>}
              {genre}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(genre);
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className={styles.presetGrid}>
        {PREDEFINED_GENRES.map((genre) => (
          <button
            key={genre}
            type="button"
            className={`${styles.presetTag} ${selectedGenres.includes(genre) ? styles.active : ''}`}
            onClick={() => toggle(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className={styles.customRow}>
        <input
          className={styles.customInput}
          type="text"
          value={customGenre}
          onChange={(e) => setCustomGenre(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          placeholder="Custom genre..."
        />
        <button
          type="button"
          className={styles.addBtn}
          onClick={addCustom}
          disabled={!customGenre.trim()}
        >
          Add
        </button>
      </div>

      {selectedGenres.length === 0 && (
        <p className={styles.hint}>Select at least one genre. First selected = main genre.</p>
      )}
      {selectedGenres.length > 1 && (
        <p className={styles.hint}>Click a selected tag to set it as main genre.</p>
      )}
    </div>
  );
}
