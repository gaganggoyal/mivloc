'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * Desktop-only advertisement shown beside the one-time chat column.
 * Fills the empty half of wide screens with a live demo of the 60-second
 * self-destructing encryption you get with a free Mivloc account.
 */
export default function OncePromo() {
  const [locked, setLocked] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setLocked((v) => !v), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-sky/15
      bg-gradient-to-br from-navy via-navy2 to-[#06152a] flex-col items-center justify-center px-14">
      {/* soft glow orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-sky/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-mint/15 blur-3xl" />

      <div className="relative max-w-md w-full">
        <div className="flex items-center gap-2.5 mb-7">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky to-mint flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(14,165,233,.5)]">🛡️</span>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-mint to-skyl bg-clip-text text-transparent">Mivloc</span>
        </div>

        <h2 className="text-[28px] leading-tight font-bold mb-3">
          Liked the vanish?<br />
          Your real chats can <span className="text-mint">self-destruct too.</span>
        </h2>
        <p className="text-sm text-skyl leading-relaxed mb-6">
          Create a free account and every message auto-encrypts <b className="text-ice">60 seconds</b> after it&apos;s read —
          locked behind a secret code only you and your friend know.
        </p>

        {/* Live encryption demo */}
        <div className="card p-4 mb-6">
          <div className="flex justify-start mb-2">
            <div className="max-w-[80%] px-3.5 py-2 rounded-2xl rounded-bl-md bg-card border border-sky/15 text-sm">
              <div className="text-[10px] text-mint mb-0.5">Riya</div>
              Did you get the package?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[80%] px-3.5 py-2 rounded-2xl rounded-br-md bg-gradient-to-br from-sky to-mint text-white text-sm">
              <span className={`block transition-all duration-700 ${locked ? 'blur-[5px] opacity-70' : 'blur-0 opacity-100'}`}>
                {locked ? '🔒 ▪▪▪▪ ▪▪▪▪▪▪▪▪' : 'Yes — the code is 4471'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-center pt-2 text-mint/80">
            {locked ? '🔒 Locked — encrypted, unreadable without the code' : '⏳ Readable for 60 seconds…'}
          </div>
        </div>

        <ul className="space-y-2.5 mb-7 text-sm text-skyl/90">
          <li className="flex items-center gap-2.5"><span className="text-base">🔐</span> 60-second self-destructing encryption</li>
          <li className="flex items-center gap-2.5"><span className="text-base">🔑</span> A secret unlock code you set per friend</li>
          <li className="flex items-center gap-2.5"><span className="text-base">💬</span> Message anyone by their <span className="font-mono text-mint">@username</span></li>
        </ul>

        <Link href="/auth/login" className="btn-primary w-full text-center !py-3 text-base block">
          🛡️ Create your free account
        </Link>
        <p className="text-center text-xs text-skyl/60 mt-3">
          Already have one? <Link href="/auth/login" className="text-mint font-medium">Sign in</Link>
        </p>
      </div>
    </aside>
  )
}
