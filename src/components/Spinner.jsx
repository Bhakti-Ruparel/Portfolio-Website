import './Spinner.css'

export default function Spinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading">
      <div className="spinner" aria-hidden="true" />
      <span className="spinner-text">Loading repositories…</span>
    </div>
  )
}
