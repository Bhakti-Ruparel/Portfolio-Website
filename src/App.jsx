import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import GithubRepos from './pages/GithubRepos'
import TodoPage from './pages/TodoPage'
import TasksPage from './pages/TasksPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { getToken, clearToken } from './utils/api'

// ── localStorage key for the local (non-API) todo badge count ────────────────
const TODO_STORAGE_KEY = 'portfolio-todos'

function loadActiveCount() {
  try {
    const raw = localStorage.getItem(TODO_STORAGE_KEY)
    const tasks = raw ? JSON.parse(raw) : []
    return tasks.filter((t) => !t.completed).length
  } catch {
    return 0
  }
}

// ── ProtectedRoute ────────────────────────────────────────────────────────────
// Wraps any route that requires authentication.
// If no token is present in localStorage, redirects to /login.
function ProtectedRoute({ children }) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

// ── Home (portfolio landing page) ─────────────────────────────────────────────
function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contact />
    </>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  // Local todo page badge count (localStorage-backed, not API)
  const [todoActiveCount, setTodoActiveCount] = useState(loadActiveCount)

  // Auth state — derive initial value from localStorage so a page refresh
  // doesn't log the user out.
  const [token, setToken_] = useState(() => getToken())

  useEffect(() => {
    setTodoActiveCount(loadActiveCount())
  }, [])

  // Called by LoginPage after a successful /login response.
  function handleLogin(newToken) {
    setToken_(newToken)
  }

  // Called by Navbar "Logout" button.
  function handleLogout() {
    clearToken()
    setToken_(null)
  }

  return (
    <div className="app">
      <Navbar
        todoActiveCount={todoActiveCount}
        isLoggedIn={!!token}
        onLogout={handleLogout}
      />
      <main>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<Home />} />
          <Route path="/repos" element={<GithubRepos />} />
          <Route path="/todo" element={<TodoPage onCountChange={setTodoActiveCount} />} />

          {/* ── Auth routes ── */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Protected route ── */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage onCountChange={() => {}} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
