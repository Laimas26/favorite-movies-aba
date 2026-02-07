import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import styles from './Navbar.module.css';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        MyMovies <span>/ favorites</span>
      </Link>
      <div className={styles.actions}>
        <Link to="/" className={styles.link}>
          My list
        </Link>
        <Link to="/about" className={styles.link}>
          About
        </Link>
        {user ? (
          <>
            <Link to="/profile" className={styles.userLink}>
              {user.name}
            </Link>
            <button
              className={styles.logoutBtn}
              onClick={() => dispatch(logout())}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.link}>
              Log in
            </Link>
            <Link to="/register" className={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
