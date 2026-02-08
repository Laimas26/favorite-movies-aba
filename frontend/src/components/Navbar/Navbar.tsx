import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import logo from '../../assets/logo.png';
import styles from './Navbar.module.css';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
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
                Profile
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
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.mobileOverlayOpen : ''}`}
        onClick={closeMenu}
      />
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>Menu</span>
          <button className={styles.mobileCloseBtn} onClick={closeMenu} type="button" aria-label="Close menu">
            &#10005;
          </button>
        </div>
        <Link to="/" className={styles.mobileLink} onClick={closeMenu}>
          My list
        </Link>
        <Link to="/about" className={styles.mobileLink} onClick={closeMenu}>
          About
        </Link>
        {user ? (
          <>
            <Link to="/profile" className={styles.mobileLink} onClick={closeMenu}>
              Profile
            </Link>
            <button
              className={styles.mobileLogoutBtn}
              onClick={() => { dispatch(logout()); closeMenu(); }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.mobileLink} onClick={closeMenu}>
              Log in
            </Link>
            <Link to="/register" className={styles.mobileLink} onClick={closeMenu}>
              Register
            </Link>
          </>
        )}
      </div>
    </>
  );
}
