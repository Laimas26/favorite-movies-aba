import styles from './GenreTag.module.css';

interface Props {
  genre: string;
  isMain?: boolean;
  size?: 'sm' | 'md';
}

export default function GenreTag({ genre, isMain, size = 'sm' }: Props) {
  const className = [
    styles.tag,
    isMain ? styles.main : styles.secondary,
    size === 'md' ? styles.md : '',
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={className}>{genre}</span>;
}
