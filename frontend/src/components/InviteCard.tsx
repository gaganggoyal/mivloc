'use client'
import { useState } from 'react'

/** The user's personal invite link, front and center, with share buttons. */
export default function InviteCard({ inviteLink, shareText, handle = '' }: { inviteLink: string; shareText: string; handle?: string }) {
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
      {handle && (
        <p className="text-xs text-skyl/80 mb-2">
          Your username is <span className="font-mono text-mint font-semibold">@{handle}</span> — friends can message you just by typing it. Share it out loud, no link needed.
        </p>
      )}
      <p className="text-xs text-skyl/70 mb-3">Or send this link — friends who join through it are connected to you automatically, no searching or requests.</p>
      <button onClick={copy} title="Click to copy"
        className="w-full bg-navy2/80 border border-mint/30 hover:border-mint rounded-xl px-4 py-3 font-mono text-xs text-mint break-all mb-3 text-left transition-colors">
        {inviteLink || 'Loading your link…'}
        <span className="block mt-1 text-[10px] text-skyl/50 font-sans">{copied ? '✅ Copied!' : 'Tap to copy'}</span>
      </button>
      <div className="grid grid-cols-4 gap-2">
        <a className="btn-ghost !py-2 !px-1 text-xs" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>📱<span className="hidden sm:inline"> WhatsApp</span></a>
        <a className="btn-ghost !py-2 !px-1 text-xs" href={`sms:?body=${encodeURIComponent(shareText)}`}>💬<span className="hidden sm:inline"> SMS</span></a>
        <a className="btn-ghost !py-2 !px-1 text-xs" href={`mailto:?subject=${encodeURIComponent('Join me on Mivloc')}&body=${encodeURIComponent(shareText)}`}>📧<span className="hidden sm:inline"> Email</span></a>
        <button className="btn-ghost !py-2 !px-1 text-xs" onClick={copy}>📋<span className="hidden sm:inline"> Copy</span></button>
      </div>
    </section>
  )
}
