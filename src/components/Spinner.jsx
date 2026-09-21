import './Spinner.css'

export default function Spinner({ message = 'Loading repositories…' }) {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading">
      <div className="spinner" aria-hidden="true" />
      <span className="spinner-text">{message}</span>
    </div>
  )
}
