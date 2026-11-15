import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollManager — makes navbar links like "/#about" actually scroll.
 *
 * React Router changes the URL but does not scroll to a #hash on its own.
 * This component watches the location and:
 *   • /#section → smooth-scrolls to the element with that id
 *   • any other page change → jumps to the top of the new page
 *
 * Projects and Contact are lazy-loaded, so their element may not exist yet
 * when the URL changes. We retry on each animation frame for up to ~2 s.
 * `location.key` changes on every click, so clicking the same link twice
 * scrolls again.
 */
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return undefined
    }

    const id = decodeURIComponent(hash.slice(1))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const deadline = performance.now() + 2000
    let frame

    function tryScroll() {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
        return
      }
      if (performance.now() < deadline) frame = requestAnimationFrame(tryScroll)
    }

    tryScroll()
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key])

  return null
}
