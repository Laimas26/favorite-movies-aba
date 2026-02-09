import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import api from '../../api/axios';
import styles from './Profile.module.css';

export default function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isGoogleOnly = !user.email.includes('@owner.com') && !user.email.includes('@test.com');

  const handleChangePassword = async () => {
    setResetStatus('loading');
    try {
      await api.post('/auth/forgot-password', { email: user.email });
      setResetStatus('sent');
    } catch {
      setResetStatus('error');
    }
  };

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
        <div className={styles.divider} />
        {resetStatus === 'sent' ? (
          <p className={styles.successMsg}>Reset link sent to your email! Check your inbox (or the backend console for the Ethereal preview link).</p>
        ) : resetStatus === 'error' ? (
          <p className={styles.errorMsg}>Something went wrong. Please try again.</p>
        ) : (
          <button
            className={styles.changePasswordBtn}
            onClick={handleChangePassword}
            disabled={resetStatus === 'loading'}
          >
            {resetStatus === 'loading' ? 'Sending...' : 'Change password'}
          </button>
        )}
      </div>
    </div>
  );
}
