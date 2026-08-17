import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'portfolio-todos'

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function todayStr() {
  return new Date().toISOString().split('T')[0] // "YYYY-MM-DD"
}

function isOverdue(dueDate) {
  if (!dueDate) return false
  return dueDate <= todayStr()
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
    else setValue(title) // revert if empty or unchanged
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
        className="todo-task-edit-input"
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
      className="todo-task-title"
      onClick={() => setEditing(true)}
      title="Click to edit"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}
      aria-label={`Task: ${title}. Click to edit.`}
    >
      {title}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TodoPage({ onCountChange }) {
  const [tasks, setTasks] = useState(loadTasks)
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'
  const [dragId, setDragId] = useState(null)  // id of the task being dragged
  const [dragOverId, setDragOverId] = useState(null) // id of the task being hovered over

  // Sync to localStorage and notify parent badge count whenever tasks change
  useEffect(() => {
    saveTasks(tasks)
    const activeCount = tasks.filter((t) => !t.completed).length
    onCountChange?.(activeCount)
  }, [tasks, onCountChange])

  // ── CRUD ────────────────────────────────────────────────────────────────────

  function addTask(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    const newTask = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      dueDate: dueDate || null,
      createdAt: Date.now(),
    }
    setTasks((prev) => [newTask, ...prev])
    setInput('')
    setDueDate('')
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function editTitle(id, newTitle) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    )
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !t.completed))
  }

  // ── Drag-and-drop ───────────────────────────────────────────────────────────

  function handleDragStart(e, id) {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, id) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== dragId) setDragOverId(id)
  }

  function handleDrop(e, targetId) {
    e.preventDefault()
    if (!dragId || dragId === targetId) {
      setDragId(null)
      setDragOverId(null)
      return
    }
    setTasks((prev) => {
      const list = [...prev]
      const fromIdx = list.findIndex((t) => t.id === dragId)
      const toIdx = list.findIndex((t) => t.id === targetId)
      const [moved] = list.splice(fromIdx, 1)
      list.splice(toIdx, 0, moved)
      return list
    })
    setDragId(null)
    setDragOverId(null)
  }

  function handleDragEnd() {
    setDragId(null)
    setDragOverId(null)
  }

  // ── Filtered view ───────────────────────────────────────────────────────────

  const visible = tasks.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const hasCompleted = tasks.some((t) => t.completed)
  const activeCount = tasks.filter((t) => !t.completed).length

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="todo-page">
      <div className="todo-header">
        <span className="todo-section-label" aria-hidden="true">Tasks</span>
        <h1 className="todo-title">To-Do List</h1>
        <p className="todo-subtitle">
          Your tasks live here — drag to reorder, click a title to edit, and filter by status.
        </p>
      </div>

      {/* ── Add task form ── */}
      <form className="todo-form" onSubmit={addTask} aria-label="Add a new task">
        <input
          className="todo-input"
          type="text"
          placeholder="Add a new task…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Task title"
        />
        <input
          className="todo-date-input"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date (optional)"
          title="Due date (optional)"
          min={todayStr()}
        />
        <button className="todo-add-btn" type="submit" aria-label="Add task">
          + Add
        </button>
      </form>

      {/* ── Filter pills + clear ── */}
      <div className="todo-controls">
        <div className="todo-filters" role="group" aria-label="Filter tasks">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              className={`todo-filter-pill ${filter === f ? 'todo-filter-pill--active' : ''}`}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {hasCompleted && (
          <button className="todo-clear-btn" onClick={clearCompleted}>
            Clear Completed
          </button>
        )}
      </div>

      {/* ── Task count summary ── */}
      <p className="todo-count" aria-live="polite">
        {activeCount === 0
          ? 'All tasks done 🎉'
          : `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`}
      </p>

      {/* ── Task list ── */}
      {visible.length === 0 ? (
        <p className="todo-empty">
          {filter === 'completed' ? 'No completed tasks yet.' : 'Nothing here — add a task above!'}
        </p>
      ) : (
        <ul className="todo-list" role="list" aria-label="Task list">
          {visible.map((task) => {
            const overdue = isOverdue(task.dueDate) && !task.completed
            const isDragging = dragId === task.id
            const isDragOver = dragOverId === task.id

            return (
              <li
                key={task.id}
                className={[
                  'todo-task',
                  task.completed ? 'todo-task--done' : '',
                  overdue ? 'todo-task--overdue' : '',
                  isDragging ? 'todo-task--dragging' : '',
                  isDragOver ? 'todo-task--dragover' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragOver={(e) => handleDragOver(e, task.id)}
                onDrop={(e) => handleDrop(e, task.id)}
                onDragEnd={handleDragEnd}
                aria-label={`Task: ${task.title}${task.completed ? ', completed' : ''}`}
              >
                {/* Drag handle */}
                <span className="todo-drag-handle" aria-hidden="true" title="Drag to reorder">
                  ⠿
                </span>

                {/* Checkbox */}
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                />

                {/* Title (inline-editable) */}
                <div className="todo-task-body">
                  <EditableTitle
                    title={task.title}
                    onSave={(newTitle) => editTitle(task.id, newTitle)}
                  />
                  {task.dueDate && (
                    <span
                      className={`todo-due-date ${overdue ? 'todo-due-date--overdue' : ''}`}
                      aria-label={`Due ${task.dueDate}${overdue ? ', overdue' : ''}`}
                    >
                      📅 {task.dueDate}
                      {overdue && <span className="todo-overdue-badge">Overdue</span>}
                    </span>
                  )}
                </div>

                {/* Delete button */}
                <button
                  className="todo-delete-btn"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete task "${task.title}"`}
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
