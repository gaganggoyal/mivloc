'use client'
import { useState } from 'react'
import DemoVideo from '@/components/DemoVideo'

/** Glowing play button for the hero; opens the narrated walkthrough in a popup. */
export default function WatchDemo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-semibold text-white
                   bg-gradient-to-br from-fuchsia-500 via-sky to-mint bg-[length:200%_200%] animate-shimmer
                   shadow-[0_4px_30px_rgba(14,165,233,.45)] transition-transform hover:-translate-y-0.5">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 animate-ping opacity-60" />
          <span className="relative text-sm">▶</span>
        </span>
        Watch how it works
        <span className="text-xs font-normal text-white/70">25 sec · with voice</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="relative w-full max-w-sm">
            <button onClick={() => setOpen(false)} aria-label="Close demo"
              className="absolute -top-11 right-0 w-9 h-9 rounded-full bg-white/10 border border-white/20 text-ice text-lg hover:bg-white/20 transition-colors">✕</button>
            {/* Mounting after click = browser allows narration audio */}
            <DemoVideo sound />
          </div>
        </div>
      )}
    </>
  )
}
