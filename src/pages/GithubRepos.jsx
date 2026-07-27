import { useState, useEffect } from 'react'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import './GithubRepos.css'

const GITHUB_API_URL = 'https://api.github.com/users/Bhakti-Ruparel/repos'

export default function GithubRepos() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  /**
   * fetchRepos is defined as a named function (not inline inside useEffect)
   * so it can be passed to <ErrorMessage onRetry={fetchRepos} /> and called
   * again when the user clicks "Retry" after a failed fetch.
   */
  function fetchRepos() {
    setLoading(true)
    setError(null)

    fetch(GITHUB_API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
        return res.json()
      })
      .then((data) => {
        // Sort by most recently updated so the freshest work appears first
        const sorted = data.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        )
        setRepos(sorted)
      })
      .catch((err) => setError(err.message))
      // .finally always runs — ensures the spinner is dismissed whether the
      // fetch succeeded or failed, so it can never get stuck in a loading state
      .finally(() => setLoading(false))
  }

  // Empty dependency array [] means this effect runs exactly once when the
  // component first mounts. Without [], it would re-run on every render and
  // cause an infinite loop of fetch → setState → re-render → fetch → …
  useEffect(() => {
    fetchRepos()
  }, [])

  // ── Filter repos by search term (case-insensitive) ───────────────────────
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ── Conditional rendering ────────────────────────────────────────────────
  if (loading) return <Spinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchRepos} />

  return (
    <div className="repos-page">
      {/* ── Page header ── */}
      <div className="repos-header">
        <span className="repos-section-label" aria-hidden="true">GitHub</span>
        <h1 className="repos-title">My Repositories</h1>
        <p className="repos-subtitle">
          Live from the GitHub API — auto-updates whenever a new repo is pushed.
        </p>

        {/* ── Search input ── */}
        <div className="repos-search-wrap">
          <svg
            className="repos-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="repos-search"
            placeholder="Search repositories…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search repositories"
          />
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="repos-count" aria-live="polite">
        {filteredRepos.length === 0
          ? 'No repositories match your search.'
          : `Showing ${filteredRepos.length} of ${repos.length} repositories`}
      </p>

      {/* ── Repo cards grid ── */}
      <ul className="repos-grid" role="list">
        {filteredRepos.map((repo) => (
          <li key={repo.id} className="repo-card" role="listitem">
            {/* Repo name + external link */}
            <div className="repo-card-top">
              <svg
                className="repo-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <h2 className="repo-name">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-link"
                  aria-label={`View ${repo.name} on GitHub (opens in new tab)`}
                >
                  {repo.name}
                </a>
              </h2>
            </div>

            {/* Description */}
            {repo.description && (
              <p className="repo-desc">{repo.description}</p>
            )}

            {/* Footer: language + stars */}
            <div className="repo-card-footer">
              {repo.language && (
                <span className="repo-language">
                  <span className="lang-dot" aria-hidden="true" />
                  {repo.language}
                </span>
              )}
              <span className="repo-stars" aria-label={`${repo.stargazers_count} stars`}>
                <svg
                  className="star-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {repo.stargazers_count}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
