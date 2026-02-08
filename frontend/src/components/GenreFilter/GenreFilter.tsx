import { PREDEFINED_GENRES } from '../../constants/genres';
import styles from './GenreFilter.module.css';

interface Props {
  selected: string[];
  onChange: (genres: string[]) => void;
}

export default function GenreFilter({ selected, onChange }: Props) {
  const toggle = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  };

  return (
    <div className={styles.genres}>
      {PREDEFINED_GENRES.map((genre) => (
        <button
          key={genre}
          className={`${styles.pill} ${selected.includes(genre) ? styles.active : ''}`}
          onClick={() => toggle(genre)}
          type="button"
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
