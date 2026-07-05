'use client'
import { useState } from 'react'

/** The user's personal invite link, front and center, with share buttons. */
export default function InviteCard({ inviteLink, shareText }: { inviteLink: string; shareText: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <section className="card p-5 border !border-mint/25">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🔗</span>
        <h2 className="font-semibold text-sm">Your invite link</h2>
      </div>
      <p className="text-xs text-skyl/70 mb-3">Friends who join through this link are connected to you automatically — no searching, no requests.</p>
      <button onClick={copy} title="Click to copy"
        className="w-full bg-navy2/80 border border-mint/30 hover:border-mint rounded-xl px-4 py-3 font-mono text-xs text-mint break-all mb-3 text-left transition-colors">
        {inviteLink || 'Loading your link…'}
        <span className="block mt-1 text-[10px] text-skyl/50 font-sans">{copied ? '✅ Copied!' : 'Tap to copy'}</span>
      </button>
      <div className="grid grid-cols-4 gap-2">
        <a className="btn-ghost !py-2 !px-1 text-xs" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>📱<span className="hidden sm:inline"> WhatsApp</span></a>
        <a className="btn-ghost !py-2 !px-1 text-xs" href={`sms:?body=${encodeURIComponent(shareText)}`}>💬<span className="hidden sm:inline"> SMS</span></a>
        <a className="btn-ghost !py-2 !px-1 text-xs" href={`mailto:?subject=${encodeURIComponent('Join me on SafeChat')}&body=${encodeURIComponent(shareText)}`}>📧<span className="hidden sm:inline"> Email</span></a>
        <button className="btn-ghost !py-2 !px-1 text-xs" onClick={copy}>📋<span className="hidden sm:inline"> Copy</span></button>
      </div>
    </section>
  )
}
