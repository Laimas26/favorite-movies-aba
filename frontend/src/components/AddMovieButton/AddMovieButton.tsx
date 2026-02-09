import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import styles from './AddMovieButton.module.css';

const FUNNY_MESSAGES = [
  "Hey! This is MY favorite movies list. Get your own! \uD83D\uDE04",
  "You want to add YOUR movies to MY list? The audacity! \uD83D\uDE24",
];

interface Props {
  onClick: () => void;
}

export default function AddMovieButton({ onClick }: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const [showTooltip, setShowTooltip] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip, msgIndex]);

  const handleUnauthorizedClick = () => {
    setMsgIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
    setShowTooltip(true);
  };

  const OWNER_EMAILS = ['laimonas.rupeika@gmail.com', 'owner@owner.com'];
  const isAllowed = OWNER_EMAILS.includes(user?.email ?? '');

  if (isAllowed) {
    return (
      <button className={styles.addButton} onClick={onClick}>
        + Add Movie
      </button>
    );
  }

  return (
    <div className={styles.wrapper}>
      {showTooltip && (
        <div className={styles.tooltip}>{FUNNY_MESSAGES[msgIndex]}</div>
      )}
      <button
        className={`${styles.addButton} ${styles.disabled}`}
        onClick={handleUnauthorizedClick}
      >
        + Add Movie
      </button>
    </div>
  );
}
