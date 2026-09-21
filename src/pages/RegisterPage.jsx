import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import './auth.css'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim() || name.trim().length < 2) {
      return setError('Name must be at least 2 characters long.')
    }

    if (!email.trim()) {
      return setError('Email is required.')
    }

    if (password !== confirm) {
      return setError('Passwords do not match.')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }

    setLoading(true)

    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      })

      setSuccess(data.message)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Eyebrow */}
        <span className="auth-eyebrow">USER REGISTRATION</span>

        {/* Heading */}
        <h1 className="auth-heading">Create Account</h1>
        <p className="auth-subtext">
          Register with secure password hashing and MongoDB storage.
        </p>

        {/* Banners */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-success" role="status">
            {success} — redirecting to login…
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              className="auth-input"
              type="text"
              placeholder="Bhakti Ruparel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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
              autoComplete="new-password"
            />
            <span className="auth-helper">At least 6 characters.</span>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm">
              Confirm Password
            </label>
            <input
              id="confirm"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            className="auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        {/* Footer link */}
        <p className="auth-footer-text">
          Already registered?{' '}
          <Link to="/login" className="auth-link">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  )
}
