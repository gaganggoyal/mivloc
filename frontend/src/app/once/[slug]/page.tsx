'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase'
import OncePromo from '@/components/OncePromo'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface EphMsg { id: string; from: string; nick: string; text: string; at: number }

/**
 * One-time room. Messages travel over Supabase Realtime BROADCAST only —
 * they are never written to any database. When either participant leaves
 * (closes tab, navigates away, presses Leave), a dissolve signal fires,
 * the room row is deleted, and both sides watch the chat get lost in space.
 */
export default function OneTimeRoom() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const supabase = supabaseBrowser()

  const [phase, setPhase] = useState<'checking'|'join'|'open'|'dissolved'|'notfound'>('checking')
  const [nick, setNick] = useState('')
  const [msgs, setMsgs] = useState<EphMsg[]>([])
  const [draft, setDraft] = useState('')
  const [peers, setPeers] = useState(1)
  const myIdRef = useRef(Math.random().toString(36).slice(2, 10))
  const chanRef = useRef<RealtimeChannel | null>(null)
  const dissolvedRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Room must exist
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.from('onetime_rooms').select('slug').eq('slug', slug).maybeSingle()
      if (!data) { setPhase('notfound'); return }
      const saved = sessionStorage.getItem(`sc_once_nick_${slug}`)
      if (saved) { setNick(saved); join(saved) } else setPhase('join')
    })()
    return () => {
      // In-app navigation away = leaving the room too
      if (chanRef.current) { supabase.removeChannel(chanRef.current); chanRef.current = null }
    }
  }, [slug]) // eslint-disable-line

  function join(name: string) {
    if (chanRef.current) return // already joined (dev double-effect / double click)
    const nickname = name.trim() || 'Anonymous'
    setPhase('open')
    const chan = supabase.channel(`once:${slug}`, { config: { presence: { key: myIdRef.current }, broadcast: { self: true } } })
    chanRef.current = chan

    chan
      .on('broadcast', { event: 'msg' }, ({ payload }) => {
        setMsgs((p) => [...p, payload as EphMsg])
      })
      .on('broadcast', { event: 'dissolve' }, () => dissolve(false))
      .on('presence', { event: 'sync' }, () => {
        setPeers(Object.keys(chan.presenceState()).length)
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        // The other person left → chat is gone for everyone
        if (key !== myIdRef.current && !dissolvedRef.current) dissolve(true)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await chan.track({ nick: nickname, joined: Date.now() })
      })
  }

  async function dissolve(broadcastIt: boolean) {
    if (dissolvedRef.current) return
    dissolvedRef.current = true
    try {
      if (broadcastIt && chanRef.current) {
        await chanRef.current.send({ type: 'broadcast', event: 'dissolve', payload: {} })
      }
      await supabase.from('onetime_rooms').delete().eq('slug', slug)
    } catch {}
    setMsgs([])          // wipe from memory
    setPhase('dissolved')
    setTimeout(() => { supabase.removeAllChannels() }, 400)
  }

  // Leaving = dissolving (the core promise). pagehide + keepalive fetch
  // survives tab close, unlike a normal async call.
  useEffect(() => {
    const bye = () => {
      if (dissolvedRef.current || !chanRef.current) return // only once actually inside
      dissolvedRef.current = true
      try { chanRef.current?.send({ type: 'broadcast', event: 'dissolve', payload: {} }) } catch {}
      try {
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        fetch(`${base}/rest/v1/onetime_rooms?slug=eq.${encodeURIComponent(slug)}`, {
          method: 'DELETE',
          headers: { apikey: key, Authorization: `Bearer ${key}` },
          keepalive: true,
        })
      } catch {}
    }
    window.addEventListener('pagehide', bye)
    return () => { window.removeEventListener('pagehide', bye) }
  }, [slug]) // eslint-disable-line

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !chanRef.current) return
    setDraft('')
    await chanRef.current.send({
      type: 'broadcast', event: 'msg',
      payload: { id: Math.random().toString(36).slice(2), from: myIdRef.current, nick, text, at: Date.now() } satisfies EphMsg,
    })
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])

  if (phase === 'checking') return <Center><p className="text-skyl text-sm">Finding room…</p></Center>

  if (phase === 'notfound') return (
    <Center>
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-3">💨</div>
        <h1 className="font-bold mb-2">This chat is gone</h1>
        <p className="text-sm text-skyl mb-6">Either it never existed, or someone left and it dissolved into space. That&apos;s the whole point.</p>
        <Link href="/once" className="btn-primary w-full">Create a new one-time chat</Link>
      </div>
    </Center>
  )

  if (phase === 'dissolved') return (
    <Center>
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-3 animate-pulse">🌌</div>
        <h1 className="font-bold mb-2">Chat dissolved in space</h1>
        <p className="text-sm text-skyl mb-6">Someone left the room, so every message was destroyed — nothing was ever saved to any server.</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/once" className="btn-primary text-xs !py-2.5">New one-time chat</Link>
          <Link href="/" className="btn-ghost text-xs !py-2.5">Mivloc home</Link>
        </div>
      </div>
    </Center>
  )

  if (phase === 'join') return (
    <Center>
      <div className="card p-7 max-w-sm w-full text-center">
        <div className="text-4xl mb-2">💨</div>
        <h1 className="font-bold mb-1">Join one-time chat</h1>
        <p className="text-xs text-mint font-mono mb-1">/once/{slug}</p>
        <p className="text-xs text-skyl mb-5">Nothing here is ever stored. When anyone leaves, it all vanishes.</p>
        <form onSubmit={(e) => { e.preventDefault(); join(nick) }} className="space-y-3">
          <input className="input text-center" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Display name (optional)" maxLength={24} autoFocus />
          <button className="btn-primary w-full">Enter room →</button>
        </form>
      </div>
    </Center>
  )

  return (
    <main className="bg-orbs h-screen flex">
      {/* Desktop: fill the other half with a sign-up advertisement so the
          chat stays a cosy column instead of stretching edge-to-edge. */}
      <OncePromo />

      {/* Chat column — full width on mobile, half the screen on desktop */}
      <section className="w-full lg:w-1/2 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-sky/20">
          <span className="text-xl">💨</span>
          <div className="flex-1">
            <div className="text-sm font-semibold font-mono">/once/{slug}</div>
            <div className="text-[11px] text-mint">{peers} inside · vanishes when anyone leaves · nothing stored</div>
          </div>
          <button className="btn-danger !px-3 !py-2 text-xs" onClick={() => dissolve(true)}>Leave & destroy</button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {msgs.length === 0 && (
            <div className="text-center pt-16">
              <div className="text-4xl mb-3">🌌</div>
              <p className="text-sm text-skyl">This space is empty and temporary.<br/>Messages exist only on your two screens.</p>
            </div>
          )}
          {msgs.map((m) => {
            const mine = m.from === myIdRef.current
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm ${mine ? 'bg-gradient-to-br from-sky to-mint text-white rounded-br-md' : 'bg-card border border-sky/15 rounded-bl-md'}`}>
                  {!mine && <div className="text-[10px] text-mint mb-0.5">{m.nick || 'Anonymous'}</div>}
                  <div>{m.text}</div>
                  <div className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-skyl/50'}`}>
                    {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="p-3 bg-navy/95 border-t border-sky/15 flex gap-2">
          <input className="input flex-1 !py-2.5" value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder="Message (never stored anywhere)…" maxLength={2000} />
          <button className="btn-primary !px-5 !py-2.5" disabled={!draft.trim()}>Send</button>
        </form>
      </section>
    </main>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <main className="bg-orbs min-h-screen flex items-center justify-center px-4">{children}</main>
}
