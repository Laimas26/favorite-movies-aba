import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, googleLogin, clearError } from '../../store/slices/authSlice';
import api from '../../api/axios';
import styles from './Login.module.css';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus('loading');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
    } catch {
      // Always show success to not leak email existence
    }
    setForgotStatus('sent');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to manage your favorite movies</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
            />
          </div>
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {!showForgot ? (
          <button className={styles.forgotLink} onClick={() => setShowForgot(true)} type="button">
            Forgot password?
          </button>
        ) : forgotStatus === 'sent' ? (
          <p className={styles.forgotSuccess}>If an account with that email exists, a reset link has been generated. Check the backend console logs for the preview URL.</p>
        ) : (
          <form className={styles.forgotForm} onSubmit={handleForgotSubmit}>
            <input
              className={styles.input}
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
            <button className={styles.forgotBtn} type="submit" disabled={forgotStatus === 'loading'}>
              {forgotStatus === 'loading' ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
        <div className={styles.divider}>
          <span>or continue with</span>
        </div>
        <div className={styles.googleBtn}>
          <GoogleLogin
            onSuccess={(response) => {
              if (response.credential) {
                dispatch(googleLogin(response.credential));
              }
            }}
            onError={() => {
              console.error('Google login failed');
            }}
            width="320"
          />
        </div>
        <p className={styles.footer}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
