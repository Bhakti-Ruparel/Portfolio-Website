import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import './auth.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      return setError('Please enter your email address.')
    }

    setLoading(true)

    try {
      const data = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      setSuccess(data.message)
    } catch (err) {
      setError(err.message || 'Unable to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-eyebrow">PASSWORD RESET</span>
        <h1 className="auth-heading">Forgot Your Password?</h1>
        <p className="auth-subtext">
          Enter your email and we will send you a secure reset link.
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success" role="status">
            {success}
          </div>
        )}

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

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-footer-text">
          Remembered your password?{' '}
          <Link to="/login" className="auth-link">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
