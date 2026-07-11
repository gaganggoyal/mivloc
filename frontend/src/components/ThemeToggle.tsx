'use client'
import { useEffect, useState } from 'react'

/**
 * Light/dark theme switch. The actual theme is applied to <html data-theme>
 * by an inline script in layout.tsx (before paint, so there's no flash); this
 * button just flips it and remembers the choice in localStorage.
 * `inline` sits in a header next to the brand; `floating` hovers bottom-right
 * on pages without a header.
 */
export default function ThemeToggle({ variant = 'floating' }: { variant?: 'floating' | 'inline' }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const t = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
    setTheme(t)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('mv_theme', next) } catch { /* ignore */ }
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className={variant === 'floating'
        ? `fixed bottom-4 right-4 z-[60] w-11 h-11 rounded-xl bg-card/80 border border-sky/30
           backdrop-blur-xl flex items-center justify-center text-lg shadow-lg
           hover:border-mint hover:-translate-y-0.5 transition-all`
        : `w-8 h-8 rounded-lg bg-card/60 border border-sky/25 flex items-center justify-center
           text-sm hover:border-mint transition-colors`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
