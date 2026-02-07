import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import logo from '../../assets/logo.png';
import styles from './Navbar.module.css';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        <img src={logo} alt="Not Your Movies" className={styles.logoImg} />
      </Link>
      <div className={styles.navLinks}>
        <Link to="/" className={styles.navLink}>
          My list
        </Link>
        <Link to="/about" className={styles.navLink}>
          About
        </Link>
      </div>
      <div className={styles.actions}>
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
