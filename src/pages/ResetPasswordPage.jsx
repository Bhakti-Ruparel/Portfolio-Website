import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import './auth.css'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirm) {
      return setError('Passwords do not match.')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.')
    }

    setLoading(true)

    try {
      const data = await apiFetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      })

      setSuccess(data.message)
      setTimeout(() => navigate('/login'), 1400)
    } catch (err) {
      setError(err.message || 'Unable to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-eyebrow">RESET PASSWORD</span>
        <h1 className="auth-heading">Set New Password</h1>
        <p className="auth-subtext">
          Create a new secure password for your account.
        </p>

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

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              New Password
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
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm">
              Confirm New Password
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

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link to="/login" className="auth-link">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
