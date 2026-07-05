'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabaseBrowser } from '@/lib/supabase'
import { deriveKey, decryptText, encryptText, verifyCode, makeCodeCheck, genSalt, genChatKeyB64, importChatKey } from '@/lib/crypto'
import type { Chat, DbMessage, Profile, UiMessage } from '@/types'

const LOCK_MS = 60_000 // the whole conversation re-encrypts 60s after unlock

/** My personal code slot on the chat row (each user has their own). */
function myCodeCols(c: Chat, meId: string) {
  return meId === c.user_a
    ? { salt: c.code_salt_a, check: c.code_check_a }
    : { salt: c.code_salt_b, check: c.code_check_b }
}

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const router = useRouter()
  const supabase = supabaseBrowser()

  const [meId, setMeId] = useState('')
  const [friend, setFriend] = useState<Profile | null>(null)
  const [phase, setPhase] = useState<'loading' | 'set-code' | 'enter-code' | 'open'>('loading')
  const [code, setCode] = useState('')
  const [codeErr, setCodeErr] = useState('')
  const [busy, setBusy] = useState(false)

  const keyRef = useRef<CryptoKey | null>(null)
  const chatRef = useRef<Chat | null>(null)
  const meIdRef = useRef('')
  const [msgs, setMsgsState] = useState<UiMessage[]>([])
  const msgsRef = useRef<UiMessage[]>([])
  const setMsgs = useCallback((next: UiMessage[] | ((prev: UiMessage[]) => UiMessage[])) => {
    setMsgsState((prev) => {
      const v = typeof next === 'function' ? next(prev) : next
      msgsRef.current = v
      return v
    })
  }, [])
  const [draft, setDraft] = useState('')
  const [unlockedAt, setUnlockedAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const bottomRef = useRef<HTMLDivElement>(null)

  const locked = unlockedAt === null
  const remaining = unlockedAt ? Math.max(0, LOCK_MS - (now - unlockedAt)) : 0

  // ── Load chat + friend, subscribe realtime (always on) ─────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      if (cancelled) return
      setMeId(user.id); meIdRef.current = user.id
      const { data: c } = await supabase.from('chats').select('*').eq('id', chatId).single()
      if (!c) { router.replace('/dashboard'); return }
      if (cancelled) return
      chatRef.current = c
      const friendId = c.user_a === user.id ? c.user_b : c.user_a
      const { data: f } = await supabase.from('profiles').select('*').eq('id', friendId).single()
      if (cancelled) return
      setFriend(f)

      const { data: rows } = await supabase.from('messages')
        .select('*').eq('chat_id', chatId).order('created_at', { ascending: true }).limit(500)
      if (cancelled) return
      setMsgs(((rows ?? []) as DbMessage[]).map((m) => ({ ...m, plaintext: null })))
      setPhase(myCodeCols(c, user.id).salt ? 'enter-code' : 'set-code')
    })()

    const chan = supabase.channel(`chat:${chatId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        async (payload) => {
          const m = payload.new as DbMessage
          let plaintext: string | null = null
          if (keyRef.current) { try { plaintext = await decryptText(keyRef.current, m.ciphertext) } catch {} }
          setMsgs((prev) => prev.some(p => p.id === m.id) ? prev : [...prev, { ...m, plaintext }])
        })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(chan) }
  }, [chatId]) // eslint-disable-line

  // ── Lock engine: whole chat re-encrypts LOCK_MS after unlock ──
  const lock = useCallback(() => {
    keyRef.current = null // key leaves memory — only your code brings it back
    setUnlockedAt(null)
    setMsgs((prev) => prev.map((m) => ({ ...m, plaintext: null })))
    setCode('')
  }, [setMsgs])

  useEffect(() => {
    if (unlockedAt === null) return
    const t = setInterval(() => {
      setNow(Date.now())
      if (Date.now() - unlockedAt >= LOCK_MS) lock()
    }, 1000)
    return () => clearInterval(t)
  }, [unlockedAt, lock])

  async function decryptAll(key: CryptoKey) {
    const next: UiMessage[] = []
    for (const m of msgsRef.current) {
      try { next.push({ ...m, plaintext: await decryptText(key, m.ciphertext) }) }
      catch { next.push({ ...m, plaintext: null }) }
    }
    setMsgs(next)
  }

  async function openWithKey(c: Chat) {
    keyRef.current = await importChatKey(c.chat_key!)
    await decryptAll(keyRef.current)
    setCode('')
    setUnlockedAt(Date.now()); setNow(Date.now())
    setPhase('open')
  }

  // ── Set / enter MY code (friend has their own) ─────────────
  async function submitCode(e: React.FormEvent) {
    e.preventDefault()
    if (!code) { setCodeErr('Enter a code — anything you like'); return }
    setBusy(true); setCodeErr('')
    try {
      let c = chatRef.current!
      if (phase === 'set-code') {
        // First person in the chat creates the chat's encryption key.
        if (!c.chat_key) {
          const { data: up } = await supabase.from('chats')
            .update({ chat_key: genChatKeyB64() })
            .eq('id', chatId).is('chat_key', null).select().maybeSingle()
          if (up) c = up as Chat
          else {
            const { data: fresh } = await supabase.from('chats').select('*').eq('id', chatId).single()
            if (!fresh?.chat_key) throw new Error('no key')
            c = fresh
          }
          chatRef.current = c
        }
        // Store MY code's salt + verification blob in my own slot.
        const salt = genSalt()
        const kek = await deriveKey(code, salt)
        const check = await makeCodeCheck(kek)
        const cols = meIdRef.current === c.user_a
          ? { code_salt_a: salt, code_check_a: check }
          : { code_salt_b: salt, code_check_b: check }
        const { error } = await supabase.from('chats').update(cols).eq('id', chatId)
        if (error) throw error
        c = { ...c, ...cols }
        chatRef.current = c
      } else {
        const mine = myCodeCols(c, meIdRef.current)
        await verifyCode(code, mine.salt!, mine.check!) // throws if wrong
      }
      await openWithKey(chatRef.current!)
    } catch {
      setCodeErr(phase === 'set-code'
        ? 'Could not save your code — check your connection and try again.'
        : 'Wrong code. Only the code YOU set for this chat unlocks it.')
    } finally { setBusy(false) }
  }

  async function unlockAll(e: React.FormEvent) {
    e.preventDefault()
    const c = chatRef.current
    if (!c?.chat_key) return
    setBusy(true); setCodeErr('')
    try {
      const mine = myCodeCols(c, meIdRef.current)
      await verifyCode(code, mine.salt!, mine.check!)
      await openWithKey(c)
    } catch { setCodeErr('Wrong code') }
    finally { setBusy(false) }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !keyRef.current) return
    setDraft('')
    const ciphertext = await encryptText(keyRef.current, text)
    const { error } = await supabase.from('messages').insert({ chat_id: chatId, sender_id: meId, ciphertext })
    if (error) setCodeErr('Message failed to send — check your connection.')
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length, locked])

  // ── RENDER ─────────────────────────────────────────────────
  let content: React.ReactNode
  if (phase === 'loading') {
    content = <Center><p className="text-skyl text-sm">Opening secure channel…</p></Center>
  } else if (phase === 'set-code' || phase === 'enter-code') {
    content = (
      <Center>
        <div className="card p-7 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">{phase === 'set-code' ? '🔐' : '🔑'}</div>
          <h1 className="font-bold mb-1">
            {phase === 'set-code' ? `Choose YOUR code for chats with ${friend?.display_name ?? 'this friend'}` : `Enter your code for ${friend?.display_name ?? 'this chat'}`}
          </h1>
          <p className="text-xs text-skyl mb-5 leading-relaxed">
            {phase === 'set-code'
              ? 'Anything you like — a number, a word, a single digit. Only you need to remember it; your friend picks their own code on their side. It never leaves your device.'
              : 'This is the personal code you chose for this chat — your friend has their own.'}
          </p>
          <form onSubmit={submitCode} className="space-y-3">
            <input className="input text-center tracking-widest" type="password" value={code}
              onChange={(e) => setCode(e.target.value)} placeholder="Your secret code" autoFocus />
            {codeErr && <p className="text-red-400 text-xs">{codeErr}</p>}
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Verifying…' : phase === 'set-code' ? '🔐 Set my code & open chat' : 'Unlock chat →'}
            </button>
          </form>
          <button className="text-xs text-skyl/60 mt-4 md:hidden" onClick={() => router.push('/dashboard')}>← Back to chats</button>
        </div>
      </Center>
    )
  } else {
    content = (
      <>
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-sky/20">
          <button onClick={() => router.push('/dashboard')} className="text-skyl text-sm md:hidden" aria-label="Back to chats">←</button>
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-sky to-mint flex items-center justify-center font-bold text-white">
            {friend?.display_name.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{friend?.display_name}</div>
            <div className="text-[11px] text-mint">🔐 Encrypted · your own unlock code</div>
          </div>
          {locked ? (
            <span className="text-[11px] px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300">🔒 Locked</span>
          ) : (
            <span className={`text-[11px] px-2 py-1 rounded-lg border ${remaining < 15000 ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-mint/10 border-mint/30 text-mint'}`}>
              🔓 locks in {Math.ceil(remaining / 1000)}s
            </span>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {msgs.length === 0 && (
            <div className="text-center pt-16">
              <div className="text-4xl mb-3">🛡️</div>
              <p className="text-sm text-skyl">Say hello — every message is encrypted before it leaves your device.</p>
            </div>
          )}
          {msgs.map((m) => {
            const mine = m.sender_id === meId
            const showCipher = locked || m.plaintext === null
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${showCipher ? 'msg-locking bg-navy2/70 border border-red-500/20' : mine ? 'bg-gradient-to-br from-sky to-mint text-white rounded-br-md' : 'bg-card border border-sky/15 rounded-bl-md'}`}>
                  {showCipher ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-red-300 mb-1">🔒 Encrypted</div>
                      <div className="cipher">{m.ciphertext.slice(0, 64)}…</div>
                    </div>
                  ) : (
                    <>
                      <div>{m.plaintext}</div>
                      <div className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-skyl/50'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Locked → unlock bar; unlocked → composer */}
        {locked ? (
          <form onSubmit={unlockAll} className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-navy/95 border-t border-red-500/25 space-y-1">
            <div className="flex gap-2 items-center">
              <span className="text-lg">🔒</span>
              <input className="input flex-1 !py-2.5" type="password" value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="Locked — enter YOUR code for this chat" autoFocus />
              <button className="btn-primary !px-4 !py-2.5 text-xs" disabled={busy}>{busy ? '…' : 'Unlock'}</button>
            </div>
            {codeErr && <p className="text-red-400 text-xs pl-8">{codeErr}</p>}
          </form>
        ) : (
          <form onSubmit={send} className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-navy/95 border-t border-sky/15 flex gap-2">
            <input className="input flex-1 !py-2.5" value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a safe message…" maxLength={2000} />
            <button className="btn-primary !px-5 !py-2.5" disabled={!draft.trim()}>Send</button>
          </form>
        )}
      </>
    )
  }

  // WhatsApp-style split: chat list on the left (desktop), conversation right
  return (
    <main className="h-dvh flex bg-orbs">
      <Sidebar activeChatId={chatId} className="hidden md:flex md:w-96 md:border-r" />
      <div className="flex-1 flex flex-col min-w-0">{content}</div>
    </main>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 flex items-center justify-center px-4">{children}</div>
}
