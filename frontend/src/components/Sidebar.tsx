'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useMivloc } from '@/lib/useMivloc'
import ProfileModal from '@/components/ProfileModal'
import AddByUsername from '@/components/AddByUsername'
import type { Profile } from '@/types'

/**
 * WhatsApp-style left panel for desktop: logo, quick actions, chat list.
 */
export default function Sidebar({ activeChatId = '', className = '' }: { activeChatId?: string; className?: string }) {
  const { me, friends, chatByFriend, dbErr, inviteLink, shareText, openChat, startChatByUsername, logout, reload } = useMivloc()
  const [showProfile, setShowProfile] = useState(false)
  const [toast, setToast] = useState('')

  function say(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2600) }

  async function onFriendClick(f: Profile) {
    const ok = await openChat(f)
    if (!ok) say('Could not open chat')
  }

  return (
    <aside className={`flex flex-col bg-navy/80 backdrop-blur-xl border-sky/15 min-h-0 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sky/15">
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky to-mint flex items-center justify-center text-lg">🛡️</span>
          <span className="bg-gradient-to-r from-mint to-skyl bg-clip-text text-transparent">Mivloc</span>
        </Link>
        <div className="flex items-center gap-1">
          <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => setShowProfile(true)} title="Account settings">⚙️</button>
          <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={logout} title="Sign out">↩</button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="p-3 space-y-2 border-b border-sky/10">
        <AddByUsername onStart={startChatByUsername} />
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-ghost !py-2 text-xs" onClick={() => { navigator.clipboard.writeText(inviteLink); say('📋 Invite link copied') }} disabled={!inviteLink}>🔗 Copy invite</button>
          <a className="btn-ghost !py-2 text-xs text-center" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>📱 WhatsApp</a>
        </div>
        <Link href="/once" className="btn-ghost !py-2 text-xs w-full block text-center">💨 One-time vanishing chat</Link>
      </div>

      {dbErr && (
        <div className="m-3 p-3 rounded-xl border border-red-500/40 bg-red-500/10">
          <p className="text-xs text-red-300 font-semibold mb-1">⚠️ Database problem</p>
          <p className="text-[11px] text-red-200/90 break-words">{dbErr}</p>
          <p className="text-[11px] text-skyl/70 mt-1">Run <span className="font-mono">database/schema.sql</span> in the Supabase SQL Editor, then refresh.</p>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-skyl/50">Chats ({friends.length})</div>
        {friends.length === 0 && !dbErr && (
          <div className="text-center px-4 py-8">
            <div className="text-3xl mb-2">🌱</div>
            <p className="text-xs text-skyl leading-relaxed">No friends yet. Share your invite link — anyone who joins through it appears here automatically.</p>
          </div>
        )}
        {friends.map((f) => {
          const active = activeChatId && chatByFriend[f.id] === activeChatId
          return (
            <button key={f.id} onClick={() => onFriendClick(f)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors ${active ? 'bg-sky/15 border-mint/40' : 'bg-navy2/40 border-transparent hover:border-mint/30'}`}>
              <span className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-sky to-mint flex items-center justify-center font-bold text-white">
                {f.display_name.charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">{f.display_name}</span>
                <span className="block text-[11px] text-skyl/60 truncate">🔐 Encrypted · locks after 60s</span>
              </span>
            </button>
          )
        })}
      </div>

      {showProfile && me && <ProfileModal me={me} onClose={() => setShowProfile(false)} onSaved={() => { say('✅ Profile saved'); reload() }} />}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-card border border-mint/40 text-sm shadow-xl">{toast}</div>}
    </aside>
  )
}
