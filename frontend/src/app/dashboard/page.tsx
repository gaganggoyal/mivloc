'use client'
import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import InviteCard from '@/components/InviteCard'
import ProfileModal from '@/components/ProfileModal'
import { useSafeChat } from '@/lib/useSafeChat'
import type { Profile } from '@/types'

export default function Dashboard() {
  return (
    <>
      <MobileDashboard />
      <DesktopDashboard />
    </>
  )
}

/* ── Mobile: clean stacked sections, each with room to breathe ── */
function MobileDashboard() {
  const { me, friends, dbErr, inviteLink, shareText, openChat, logout, reload } = useSafeChat()
  const [showProfile, setShowProfile] = useState(false)
  const [toast, setToast] = useState('')
  function say(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2600) }

  async function onFriendClick(f: Profile) {
    const ok = await openChat(f)
    if (!ok) say('Could not open chat')
  }

  return (
    <main className="md:hidden bg-orbs min-h-dvh pb-12">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 bg-navy/85 backdrop-blur-xl border-b border-sky/20">
        <div className="flex items-center gap-2 font-extrabold">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky to-mint flex items-center justify-center text-lg">🛡️</span>
          <span className="bg-gradient-to-r from-mint to-skyl bg-clip-text text-transparent">SafeChat</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost !px-3 !py-2 text-xs" onClick={() => setShowProfile(true)}>⚙️</button>
          <button className="btn-ghost !px-3 !py-2 text-xs" onClick={logout}>Sign out</button>
        </div>
      </nav>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        <header className="px-1">
          <h1 className="text-2xl font-bold">Hi {me?.display_name?.split(' ')[0] ?? '…'} 👋</h1>
          <p className="text-sm text-skyl">Your safe circle, encrypted end-to-end.</p>
        </header>

        {dbErr && (
          <section className="card p-4 border !border-red-500/40 bg-red-500/10">
            <p className="text-sm text-red-300 font-semibold mb-1">⚠️ Database problem</p>
            <p className="text-xs text-red-200/90 break-words">{dbErr}</p>
          </section>
        )}

        <InviteCard inviteLink={inviteLink} shareText={shareText} />

        {/* Chats */}
        <section className="card p-5">
          <h2 className="font-semibold text-sm mb-4">💬 Your chats ({friends.length})</h2>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-sm text-skyl">No friends yet. Share your invite link above — anyone who joins through it lands here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <button key={f.id} onClick={() => onFriendClick(f)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-navy2/60 border border-sky/10 hover:border-mint/40 transition-colors text-left">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-sky to-mint flex items-center justify-center font-bold text-white">
                    {f.display_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">{f.display_name}</span>
                    <span className="block text-xs text-skyl/60">🔐 Encrypted · locks after 60s</span>
                  </span>
                  <span className="text-mint text-sm">Chat →</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* One-time chat */}
        <section className="card p-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-sm mb-1">💨 One-time chat</h2>
            <p className="text-xs text-skyl/80">Pick your own link name, share it anywhere. Vanishes the moment anyone leaves.</p>
          </div>
          <Link href="/once" className="btn-primary whitespace-nowrap !px-4 !py-2.5 text-xs">Create</Link>
        </section>
      </div>

      {showProfile && me && <ProfileModal me={me} onClose={() => setShowProfile(false)} onSaved={() => { say('✅ Profile saved'); reload() }} />}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-card border border-mint/40 text-sm shadow-xl">{toast}</div>}
    </main>
  )
}

/* ── Desktop: WhatsApp-style split — chat list left, home panel right ── */
function DesktopDashboard() {
  const { me, inviteLink, shareText } = useSafeChat()
  return (
    <main className="hidden md:flex h-dvh bg-orbs">
      <Sidebar className="w-96 border-r" />
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-8 py-12 space-y-6">
          <header>
            <h1 className="text-2xl font-bold">Hi {me?.display_name?.split(' ')[0] ?? '…'} 👋</h1>
            <p className="text-sm text-skyl">Invite a friend, then pick them on the left to start chatting.</p>
          </header>

          <InviteCard inviteLink={inviteLink} shareText={shareText} />

          <section className="card p-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-sm mb-1">💨 One-time chat</h2>
              <p className="text-xs text-skyl/80">A vanishing room with a link name you choose — no account needed for your partner.</p>
            </div>
            <Link href="/once" className="btn-primary whitespace-nowrap !px-4 !py-2.5 text-xs">Create link</Link>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold text-sm mb-3">🔐 How your privacy works</h2>
            <ul className="space-y-2 text-xs text-skyl/80 leading-relaxed">
              <li>① Every message is encrypted on your device before it is sent.</li>
              <li>② You choose your own unlock code per chat — your friend picks theirs.</li>
              <li>③ 60 seconds after unlocking, the conversation locks itself again.</li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  )
}
