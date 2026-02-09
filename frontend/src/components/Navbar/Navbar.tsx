import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import logo from '../../assets/logo.png';
import styles from './Navbar.module.css';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const scrollToSection = useCallback((id: string) => {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="Not Your Movies" className={styles.logoImg} />
        </Link>
        <div className={styles.navLinks}>
          <a href="#my-list" className={styles.navLink} onClick={(e) => { e.preventDefault(); scrollToSection('my-list'); }}>
            My list
          </a>
          <a href="#about" className={styles.navLink} onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
            About
          </a>
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
        <a href="#my-list" className={styles.mobileLink} onClick={(e) => { e.preventDefault(); closeMenu(); scrollToSection('my-list'); }}>
          My list
        </a>
        <a href="#about" className={styles.mobileLink} onClick={(e) => { e.preventDefault(); closeMenu(); scrollToSection('about'); }}>
          About
        </a>
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
