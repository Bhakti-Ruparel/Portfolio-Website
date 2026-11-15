import { useEffect, useState } from 'react'

/**
 * useActiveSection(ids, enabled)
 * Returns the id of the home-page section currently in view, so the navbar
 * can highlight it. Uses IntersectionObserver (no scroll listeners).
 *
 * Sections that are lazy-loaded appear later, so the observer re-scans the
 * page for a few seconds after mounting.
 */
export default function useActiveSection(ids, enabled = true) {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') {
      setActive('')
      return undefined
    }

    const visible = new Map()
    const observed = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio)
          else visible.delete(entry.target.id)
        })
        // Pick the first section (in page order) that is currently visible.
        const current = ids.find((id) => visible.has(id)) || ''
        setActive(current)
      },
      // A section counts as "current" when it crosses the upper-middle band of the screen.
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    )

    function observeAvailable() {
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && !observed.has(id)) {
          observer.observe(el)
          observed.add(id)
        }
      })
      return observed.size === ids.length
    }

    let attempts = 0
    observeAvailable()
    const timer = setInterval(() => {
      attempts += 1
      if (observeAvailable() || attempts > 20) clearInterval(timer)
    }, 250)

    return () => {
      clearInterval(timer)
      observer.disconnect()
    }
  }, [ids, enabled])

  return active
}
