import styles from './About.module.css';

export default function About() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>About MyMovies</h1>
        <p className={styles.subtitle}>
          A personal movie tracker to keep a curated list of your all-time
          favorite films. Add movies, rate them, leave notes, and organize your
          cinematic journey.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.icon}>🎬</span>
            <h3>Track Movies</h3>
            <p>Keep a personal list of your favorite films with posters.</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>⭐</span>
            <h3>Rate &amp; Review</h3>
            <p>Rate movies and add notes to remember why you loved them.</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>🔍</span>
            <h3>Search &amp; Sort</h3>
            <p>Quickly find any movie with search, sort by title, year, or rating.</p>
          </div>
        </div>

        <div className={styles.tech}>
          <h2 className={styles.techTitle}>Built with</h2>
          <div className={styles.techList}>
            <span className={styles.techBadge}>React</span>
            <span className={styles.techBadge}>TypeScript</span>
            <span className={styles.techBadge}>NestJS</span>
            <span className={styles.techBadge}>PostgreSQL</span>
            <span className={styles.techBadge}>Redux Toolkit</span>
            <span className={styles.techBadge}>CSS Modules</span>
          </div>
        </div>
      </div>
    </div>
  );
}
