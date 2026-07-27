import './ErrorMessage.css'

/**
 * ErrorMessage — displays a styled error card with a retry action.
 *
 * Props:
 *   message  (string)    — the error text to display
 *   onRetry  (function)  — callback invoked when the user clicks "Retry"
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-card" role="alert" aria-live="assertive">
      <span className="error-icon" aria-hidden="true">⚠️</span>
      <h3 className="error-title">Something went wrong</h3>
      <p className="error-message">{message}</p>
      <button className="error-retry-btn" onClick={onRetry} type="button">
        Retry
      </button>
    </div>
  )
}
