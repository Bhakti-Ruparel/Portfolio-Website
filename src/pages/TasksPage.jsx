import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../utils/api'
import './TasksPage.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function isOverdue(dueDate) {
  if (!dueDate) return false
  return dueDate.split('T')[0] <= todayStr()
}

// ── Inline-edit sub-component ─────────────────────────────────────────────────

function EditableTitle({ title, onSave }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(title)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit() {
    const trimmed = value.trim()
    if (trimmed && trimmed !== title) onSave(trimmed)
    else setValue(title)
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setValue(title); setEditing(false) }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="tasks-task-edit-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        aria-label="Edit task title"
      />
    )
  }

  return (
    <span
      className="tasks-task-title"
      onClick={() => setEditing(true)}
      title="Click to edit"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}
    >
      {title}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TasksPage({ onCountChange }) {
  const [tasks, setTasks] = useState([])
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  // Form state
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [formError, setFormError] = useState('')

  // Filter state
  const [filter, setFilter] = useState('all')

  // Drag state
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  // ── On mount: fetch profile + tasks ──────────────────────────────────────
  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        // Parallel: fetch user profile and tasks at the same time
        const [meData, tasksData] = await Promise.all([
          apiFetch('/me'),
          apiFetch('/tasks'),
        ])
        setUserEmail(meData.email)
        setTasks(tasksData.data || [])
      } catch (err) {
        // 401s are handled globally in apiFetch (redirect to /login)
        setApiError(err.message || 'Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Sync active count to navbar badge
  useEffect(() => {
    const activeCount = tasks.filter((t) => !t.completed).length
    onCountChange?.(activeCount)
  }, [tasks, onCountChange])

  // ── CRUD via API ──────────────────────────────────────────────────────────

  async function addTask(e) {
    e.preventDefault()
    setFormError('')
    const trimmed = input.trim()
    if (!trimmed) {
      setFormError('Title is required')
      return
    }
    try {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: trimmed, dueDate: dueDate || undefined }),
      })
      setTasks((prev) => [res.data, ...prev])
      setInput('')
      setDueDate('')
    } catch (err) {
      setFormError(err.message || 'Failed to add task')
    }
  }

  async function toggleTask(id, completed) {
    try {
      const task = tasks.find((t) => t._id === id)
      const res = await apiFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: task.title, completed: !completed }),
      })
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)))
    } catch (err) {
      setApiError(err.message)
    }
  }

  async function editTitle(id, newTitle) {
    try {
      const res = await apiFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: newTitle }),
      })
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)))
    } catch (err) {
      setApiError(err.message)
    }
  }

  async function deleteTask(id) {
    try {
      await apiFetch(`/tasks/${id}`, { method: 'DELETE' })
      setTasks((prev) => prev.filter((t) => t._id !== id))
    } catch (err) {
      setApiError(err.message)
    }
  }

  async function clearCompleted() {
    const completed = tasks.filter((t) => t.completed)
    try {
      await Promise.all(
        completed.map((t) => apiFetch(`/tasks/${t._id}`, { method: 'DELETE' }))
      )
      setTasks((prev) => prev.filter((t) => !t.completed))
    } catch (err) {
      setApiError(err.message)
    }
  }

  // ── Drag-and-drop (client-side reorder only) ──────────────────────────────

  function handleDragStart(e, id) {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, id) {
    e.preventDefault()
    if (id !== dragId) setDragOverId(id)
  }

  function handleDrop(e, targetId) {
    e.preventDefault()
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    setTasks((prev) => {
      const list = [...prev]
      const from = list.findIndex((t) => t._id === dragId)
      const to = list.findIndex((t) => t._id === targetId)
      const [moved] = list.splice(from, 1)
      list.splice(to, 0, moved)
      return list
    })
    setDragId(null)
    setDragOverId(null)
  }

  function handleDragEnd() { setDragId(null); setDragOverId(null) }

  // ── Filtered view ─────────────────────────────────────────────────────────

  const visible = tasks.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const hasCompleted = tasks.some((t) => t.completed)
  const activeCount = tasks.filter((t) => !t.completed).length

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="tasks-loading">Loading tasks…</div>
      </div>
    )
  }

  return (
    <div className="tasks-page">
      {/* ── Header ── */}
      <div className="tasks-header">
        <span className="tasks-eyebrow">PRACTICAL 7 — PROTECTED CRUD</span>
        <h1 className="tasks-title">Task Management System</h1>
        <p className="tasks-subtitle">
          Full-stack CRUD — Express + MongoDB Atlas, secured with JWT authentication.
        </p>

        {/* Status pills */}
        <div className="tasks-pills">
          <span className="tasks-pill tasks-pill--green">
            <span className="tasks-pill-dot" />
            MongoDB Atlas Connected
          </span>
          {userEmail && (
            <span className="tasks-pill tasks-pill--indigo">
              🔐 JWT Authenticated ({userEmail})
            </span>
          )}
        </div>
      </div>

      {/* Global API error */}
      {apiError && (
        <div className="tasks-api-error" role="alert">
          {apiError}
          <button className="tasks-api-error-close" onClick={() => setApiError('')}>✕</button>
        </div>
      )}

      {/* ── Add task form ── */}
      <form className="tasks-form" onSubmit={addTask} aria-label="Add a new task">
        <div className="tasks-form-row">
          <input
            className="tasks-input"
            type="text"
            placeholder="Add a new task…"
            value={input}
            onChange={(e) => { setInput(e.target.value); setFormError('') }}
            aria-label="Task title"
          />
          <input
            className="tasks-date-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date (optional)"
            min={todayStr()}
          />
          <button className="tasks-add-btn" type="submit">
            + Add
          </button>
        </div>
        {formError && <p className="tasks-form-error">{formError}</p>}
      </form>

      {/* ── Controls ── */}
      <div className="tasks-controls">
        <div className="tasks-filters" role="group" aria-label="Filter tasks">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              className={`tasks-filter-pill ${filter === f ? 'tasks-filter-pill--active' : ''}`}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {hasCompleted && (
          <button className="tasks-clear-btn" onClick={clearCompleted}>
            Clear Completed
          </button>
        )}
      </div>

      {/* Count */}
      <p className="tasks-count" aria-live="polite">
        {activeCount === 0
          ? 'All tasks done 🎉'
          : `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`}
      </p>

      {/* ── Task list ── */}
      {visible.length === 0 ? (
        <p className="tasks-empty">
          {filter === 'completed' ? 'No completed tasks yet.' : 'Nothing here — add a task above!'}
        </p>
      ) : (
        <ul className="tasks-list" role="list" aria-label="Task list">
          {visible.map((task) => {
            const overdue = isOverdue(task.dueDate) && !task.completed
            const isDragging = dragId === task._id
            const isDragOver = dragOverId === task._id
            const dueDateStr = task.dueDate ? task.dueDate.split('T')[0] : null

            return (
              <li
                key={task._id}
                className={[
                  'tasks-task',
                  task.completed ? 'tasks-task--done' : '',
                  overdue ? 'tasks-task--overdue' : '',
                  isDragging ? 'tasks-task--dragging' : '',
                  isDragOver ? 'tasks-task--dragover' : '',
                ].filter(Boolean).join(' ')}
                draggable
                onDragStart={(e) => handleDragStart(e, task._id)}
                onDragOver={(e) => handleDragOver(e, task._id)}
                onDrop={(e) => handleDrop(e, task._id)}
                onDragEnd={handleDragEnd}
              >
                <span className="tasks-drag-handle" aria-hidden="true">⠿</span>

                <input
                  type="checkbox"
                  className="tasks-checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task._id, task.completed)}
                  aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                />

                <div className="tasks-task-body">
                  <EditableTitle
                    title={task.title}
                    onSave={(newTitle) => editTitle(task._id, newTitle)}
                  />
                  {dueDateStr && (
                    <span className={`tasks-due-date ${overdue ? 'tasks-due-date--overdue' : ''}`}>
                      📅 {dueDateStr}
                      {overdue && <span className="tasks-overdue-badge">Overdue</span>}
                    </span>
                  )}
                </div>

                <button
                  className="tasks-delete-btn"
                  onClick={() => deleteTask(task._id)}
                  aria-label={`Delete "${task.title}"`}
                  title="Delete task"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
