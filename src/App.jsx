import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Footer from './components/Footer'
import Spinner from './components/Spinner'
import { getToken, clearToken } from './utils/api'

const Projects = lazy(() => import('./components/Projects'))
const Contact = lazy(() => import('./components/Contact'))
const GithubRepos = lazy(() => import('./pages/GithubRepos'))
const TodoPage = lazy(() => import('./pages/TodoPage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))

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
        <Suspense fallback={<Spinner message="Loading page..." />}>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
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
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
