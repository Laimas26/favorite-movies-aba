import { useAppSelector } from '../../store/hooks';
import styles from './Profile.module.css';

export default function Profile() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.avatar}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className={styles.name}>{user.name}</h1>
        <p className={styles.email}>{user.email}</p>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statLabel}>Member since</span>
          <span className={styles.statValue}>{memberSince}</span>
        </div>
      </div>
    </div>
  );
}
