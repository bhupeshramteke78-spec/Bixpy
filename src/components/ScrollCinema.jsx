import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollCinema() {
  const { pathname } = useLocation()

  useEffect(() => {
    const elements = [...document.querySelectorAll('[data-cinema]')]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('cinema-visible'))
      return undefined
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('cinema-visible')
        observer.unobserve(entry.target)
      }
    }), { threshold: 0.14, rootMargin: '0px 0px -8% 0px' })
    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [pathname])

  return null
}
