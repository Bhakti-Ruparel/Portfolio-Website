import { useState } from 'react'
import { apiFetch } from '../utils/api'
import { PROFILE } from '../data/portfolio'

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' }
const EMAIL_RE = /^\S+@\S+\.\S+$/

// Same rules as backend/middleware/validateContact.js — the backend re-checks
// everything, the frontend checks only to give instant feedback.
function validateContact(values) {
  const errors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const message = values.message.trim()

  if (name.length < 2) errors.name = 'Please enter your name (at least 2 characters).'
  else if (name.length > 80) errors.name = 'Name must be 80 characters or fewer.'

  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'

  if (values.subject.trim().length > 120) errors.subject = 'Subject must be 120 characters or fewer.'

  if (message.length < 10) errors.message = 'Message should be at least 10 characters.'
  else if (message.length > 2000) errors.message = 'Message must be 2000 characters or fewer.'

  return errors
}

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [serverMessage, setServerMessage] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateContact(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setStatus('sending')
    setServerMessage('')
    try {
      const data = await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      setStatus('success')
      setServerMessage(data?.message || 'Thanks! Your message has been sent.')
      setValues(EMPTY)
    } catch (err) {
      setStatus('error')
      setServerMessage(err.message || 'Could not send your message.')
    }
  }

  const sending = status === 'sending'

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate aria-label="Contact form">
      <h3 className="contact-info-title">Send a message</h3>

      <div className="contact-form-row">
        <Field label="Name" name="name" value={values.name} error={errors.name}
          onChange={handleChange} autoComplete="name" />
        <Field label="Email" name="email" type="email" value={values.email} error={errors.email}
          onChange={handleChange} autoComplete="email" />
      </div>

      <Field label="Subject (optional)" name="subject" value={values.subject} error={errors.subject}
        onChange={handleChange} />

      <Field label="Message" name="message" value={values.message} error={errors.message}
        onChange={handleChange} multiline />

      {/* Honeypot: hidden from people; bots that fill it are rejected by the API. */}
      <div className="contact-hp" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off"
          value={values.website} onChange={handleChange} />
      </div>

      <button type="submit" className="contact-cta-btn contact-submit" disabled={sending}>
        {sending ? 'Sending…' : 'Send message'}
      </button>

      {status === 'success' && (
        <p className="contact-form-status contact-form-status--ok" role="status">{serverMessage}</p>
      )}
      {status === 'error' && (
        <p className="contact-form-status contact-form-status--err" role="alert">
          {serverMessage} You can also email me directly at{' '}
          <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>.
        </p>
      )}
    </form>
  )
}

function Field({ label, name, value, error, onChange, type = 'text', multiline = false, autoComplete }) {
  const id = `contact-${name}`
  const errorId = `${id}-error`
  const common = {
    id,
    name,
    value,
    onChange,
    className: `contact-input ${error ? 'contact-input--error' : ''}`,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    autoComplete,
  }

  return (
    <div className="contact-field">
      <label htmlFor={id} className="contact-label">{label}</label>
      {multiline ? <textarea rows={5} {...common} /> : <input type={type} {...common} />}
      {error && <span id={errorId} className="contact-field-error">{error}</span>}
    </div>
  )
}
