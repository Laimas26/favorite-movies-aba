import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.rights}>
          Visos{' '}
          <span className={styles.correction}>
            <span className={styles.strikethrough}>teisės</span>
            <span className={styles.correctedWord}>katės</span>
          </span>{' '}
          saugomos 🐱
        </p>
        <p className={styles.author}>Laimonas Rupeika &bull; 2026</p>
      </div>
    </footer>
  );
}
