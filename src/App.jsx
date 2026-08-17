import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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

function App() {
  const [todoActiveCount, setTodoActiveCount] = useState(loadActiveCount)

  // Keep count in sync when the page is first loaded (reads from localStorage)
  useEffect(() => {
    setTodoActiveCount(loadActiveCount())
  }, [])

  return (
    <div className="app">
      <Navbar todoActiveCount={todoActiveCount} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/repos" element={<GithubRepos />} />
          <Route
            path="/todo"
            element={<TodoPage onCountChange={setTodoActiveCount} />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
