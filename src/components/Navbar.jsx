import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Determine if we're on the /repos page for active-link highlighting
  const isReposPage = location.pathname === '/repos'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <nav className="navbar-inner" aria-label="Main navigation">
        <Link to="/" className="navbar-logo" aria-label="Ruparel Bhakti home">
          <span className="logo-icon" aria-hidden="true">RB</span>
          <span className="logo-name">Ruparel Bhakti</span>
        </Link>

        <ul className="navbar-links" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="nav-link">{link.label}</a>
            </li>
          ))}
          {/* GitHub Repos page link — uses <Link> for client-side routing */}
          <li>
            <Link
              to="/repos"
              className={`nav-link nav-link--page ${isReposPage ? 'nav-link--active' : ''}`}
              aria-current={isReposPage ? 'page' : undefined}
            >
              GitHub Repos
            </Link>
          </li>
        </ul>

        <a
          href="https://github.com/Bhakti-Ruparel"
          target="_blank"
          rel="noreferrer"
          className="navbar-cta"
          aria-label="View GitHub profile"
        >
          GitHub
        </a>

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
