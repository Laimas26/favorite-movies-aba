import { useState, useRef, useEffect } from 'react';
import styles from './SearchBar.module.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(val);
    }, 300);
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>&#128269;</span>
      <input
        className={styles.input}
        type="text"
        placeholder="Search movies by title..."
        value={localValue}
        onChange={handleChange}
      />
    </div>
  );
}
