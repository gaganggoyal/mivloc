'use client'
import { useState } from 'react'

/**
 * "Message someone by their username" — the direct way for two registered
 * users to start chatting without an invite link.
 * onStart returns '' on success (we navigate to the chat) or an error message.
 */
export default function AddByUsername({ onStart }: { onStart: (u: string) => Promise<string> }) {
  const [u, setU] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function go(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setBusy(true)
    const msg = await onStart(u)
    setBusy(false)
    if (msg) setErr(msg)
    else setU('')
  }

  return (
    <form onSubmit={go}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-skyl/60">@</span>
          <input
            className="input pl-7 !py-2 text-sm"
            value={u}
            onChange={(e) => setU(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="friend's username"
            maxLength={20}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <button className="btn-primary !px-4 !py-2 text-sm whitespace-nowrap" disabled={busy || !u}>
          {busy ? '…' : 'Message'}
        </button>
      </div>
      {err && <p className="text-red-400 text-xs mt-1.5">{err}</p>}
    </form>
  )
}
