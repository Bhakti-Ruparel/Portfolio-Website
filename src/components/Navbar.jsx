import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar({ todoActiveCount = 0, isLoggedIn = false, onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const isReposPage = location.pathname === '/repos'
  const isTodoPage  = location.pathname === '/todo'
  const isTasksPage = location.pathname === '/tasks'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch the logged-in user's email for the pill display.
  // Re-runs whenever isLoggedIn changes (login / logout).
  useEffect(() => {
    if (!isLoggedIn) {
      setUserEmail('')
      return
    }
    apiFetch('/me')
      .then((data) => setUserEmail(data.email))
      .catch(() => setUserEmail(''))
  }, [isLoggedIn])

  async function handleLogout() {
    try {
      const hasToken = Boolean(localStorage.getItem('token'))
      if (hasToken) {
        await apiFetch('/api/auth/logout', { method: 'POST' })
      }
    } catch (error) {
      // Ignore server-side logout errors and always clear the local session.
    }

    onLogout()
    navigate('/login')
    setMenuOpen(false)
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <nav className="navbar-inner" aria-label="Main navigation">

        {/* ── Logo ── */}
        <Link to="/" className="navbar-logo" aria-label="Ruparel Bhakti home">
          <span className="logo-icon" aria-hidden="true">RB</span>
          <span className="logo-name">Ruparel Bhakti</span>
        </Link>

        {/* ── Desktop links ── */}
        <ul className="navbar-links" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="nav-link">{link.label}</a>
            </li>
          ))}

          <li>
            <Link
              to="/repos"
              className={`nav-link nav-link--page ${isReposPage ? 'nav-link--active' : ''}`}
              aria-current={isReposPage ? 'page' : undefined}
            >
              GitHub Repos
            </Link>
          </li>

          <li>
            <Link
              to="/todo"
              className={`nav-link nav-link--page ${isTodoPage ? 'nav-link--active' : ''}`}
              aria-current={isTodoPage ? 'page' : undefined}
            >
              To-Do
              {todoActiveCount > 0 && (
                <span className="nav-todo-badge" aria-label={`${todoActiveCount} active tasks`}>
                  {todoActiveCount}
                </span>
              )}
            </Link>
          </li>

          <li>
            <Link
              to="/tasks"
              className={`nav-link nav-link--page ${isTasksPage ? 'nav-link--active' : ''}`}
              aria-current={isTasksPage ? 'page' : undefined}
            >
              Tasks
            </Link>
          </li>
        </ul>

        {/* ── Right side: auth controls + GitHub CTA ── */}
        <div className="navbar-right">
          {isLoggedIn ? (
            <>
              {userEmail && (
                <span className="nav-user-pill" title={userEmail}>
                  {userEmail}
                </span>
              )}
              <button className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-auth-btn nav-auth-btn--ghost">
                Login
              </Link>
              <Link to="/register" className="nav-auth-btn nav-auth-btn--solid">
                Register
              </Link>
            </>
          )}

          <a
            href="https://github.com/Bhakti-Ruparel"
            target="_blank"
            rel="noreferrer"
            className="navbar-cta"
            aria-label="View GitHub profile"
          >
            GitHub
          </a>
        </div>

        {/* ── Burger (mobile) ── */}
        <button
          className="burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`burger-bar ${menuOpen ? 'bar1-open' : ''}`} />
          <span className={`burger-bar ${menuOpen ? 'bar2-open' : ''}`} />
          <span className={`burger-bar ${menuOpen ? 'bar3-open' : ''}`} />
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="mobile-menu" role="navigation" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}

          <Link
            to="/repos"
            className={`mobile-link ${isReposPage ? 'mobile-link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            GitHub Repos
          </Link>

          <Link
            to="/todo"
            className={`mobile-link ${isTodoPage ? 'mobile-link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            To-Do
            {todoActiveCount > 0 && (
              <span className="nav-todo-badge">{todoActiveCount}</span>
            )}
          </Link>

          <Link
            to="/tasks"
            className={`mobile-link ${isTasksPage ? 'mobile-link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Tasks
          </Link>

          {/* Auth section in mobile menu */}
          {isLoggedIn ? (
            <>
              {userEmail && (
                <span className="mobile-link mobile-user-email">{userEmail}</span>
              )}
              <button className="mobile-link mobile-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="mobile-link mobile-cta" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}

          <a
            href="https://github.com/Bhakti-Ruparel"
            target="_blank"
            rel="noreferrer"
            className="mobile-link mobile-cta"
          >
            GitHub ↗
          </a>
        </div>
      )}
    </header>
  )
}
