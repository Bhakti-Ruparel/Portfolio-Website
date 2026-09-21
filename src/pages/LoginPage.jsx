import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, setToken } from '../utils/api'
import './auth.css'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      setToken(data.token)
      onLogin(data.token)
      navigate('/tasks')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Eyebrow */}
        <span className="auth-eyebrow">AUTHENTICATION</span>

        {/* Heading */}
        <h1 className="auth-heading">Welcome Back</h1>
        <p className="auth-subtext">
          Sign in to manage your MongoDB-backed tasks securely.
        </p>

        {/* Error banner */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            className="auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer links */}
        <p className="auth-footer-text">
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </p>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
