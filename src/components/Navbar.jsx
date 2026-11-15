import { useState, useEffect, memo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiFetch, getToken } from '../utils/api'
import { NAV_SECTIONS, PROFILE, SOCIAL_LINKS } from '../data/portfolio'
import useActiveSection from '../hooks/useActiveSection'
import profilePhoto from '../assets/hero.png'
import './Navbar.css'

// Module-level constant so the hook receives a stable array reference.
const SECTION_IDS = NAV_SECTIONS.map((s) => s.id)

// Pages that live on their own route (not a section of the home page).
const PAGE_LINKS = [
  { label: 'GitHub Repos', to: '/repos' },
  { label: 'To-Do', to: '/todo', badge: true },
  { label: 'Tasks', to: '/tasks' },
]

// memo: App re-renders when its own state changes (e.g. the to-do badge count).
// Navbar only needs to re-render when its props actually change.
function Navbar({ todoActiveCount = 0, isLoggedIn = false, onLogout, user }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const userEmail = user?.email || ''
  const activeSection = useActiveSection(SECTION_IDS, location.pathname === '/')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  async function handleLogout() {
    try {
      if (getToken()) {
        await apiFetch('/api/auth/logout', { method: 'POST' })
      }
    } catch {
      // Ignore server-side logout errors and always clear the local session.
    }

    onLogout()
    navigate('/login')
  }

  function renderBadge() {
    if (!isLoggedIn || todoActiveCount <= 0) return null
    return (
      <span className="nav-todo-badge" aria-label={`${todoActiveCount} active to-dos`}>
        {todoActiveCount}
      </span>
    )
  }

  return (
    <header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${menuOpen ? 'navbar--menu-open' : ''}`}
      role="banner"
    >
      <nav className="navbar-inner" aria-label="Main navigation">

        {/* ── Logo: photo + name, returns to the top of the home page ── */}
        <Link to="/#hero" className="navbar-logo" aria-label={`${PROFILE.name} — home`}>
          <img src={profilePhoto} alt="" className="logo-photo" width="36" height="36" />
          <span className="logo-name">{PROFILE.name}</span>
        </Link>

        {/* ── Desktop links ── */}
        <ul className="navbar-links" role="list">
          {NAV_SECTIONS.map((section) => (
            <li key={section.id}>
              <Link
                to={`/#${section.id}`}
                className={`nav-link ${activeSection === section.id ? 'nav-link--current' : ''}`}
                aria-current={activeSection === section.id ? 'location' : undefined}
              >
                {section.label}
              </Link>
            </li>
          ))}

          {PAGE_LINKS.map((page) => {
            const active = location.pathname === page.to
            return (
              <li key={page.to}>
                <Link
                  to={page.to}
                  className={`nav-link nav-link--page ${active ? 'nav-link--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {page.label}
                  {page.badge && renderBadge()}
                </Link>
              </li>
            )
          })}
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
            href={SOCIAL_LINKS.github}
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
          {NAV_SECTIONS.map((section) => (
            <Link
              key={section.id}
              to={`/#${section.id}`}
              className={`mobile-link ${activeSection === section.id ? 'mobile-link--active' : ''}`}
            >
              {section.label}
            </Link>
          ))}

          {PAGE_LINKS.map((page) => (
            <Link
              key={page.to}
              to={page.to}
              className={`mobile-link ${location.pathname === page.to ? 'mobile-link--active' : ''}`}
            >
              {page.label}
              {page.badge && renderBadge()}
            </Link>
          ))}

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
              <Link to="/login" className="mobile-link">Login</Link>
              <Link to="/register" className="mobile-link mobile-cta">Register</Link>
            </>
          )}

          <a
            href={SOCIAL_LINKS.github}
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

export default memo(Navbar)
