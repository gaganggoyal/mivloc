'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser, SITE_URL, describeError } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,31}$/

function randomSuggestion() {
  const a = ['moon','tiger','cloud','river','nova','pixel','ember','lotus','falcon','onyx']
  const b = ['whisper','vault','link','room','signal','space','echo','door','line','nest']
  return `${a[Math.floor(Math.random()*a.length)]}-${b[Math.floor(Math.random()*b.length)]}-${Math.floor(10+Math.random()*89)}`
}

export default function CreateOneTime() {
  const supabase = supabaseBrowser()
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [nick, setNick] = useState('')
  const [status, setStatus] = useState<'idle'|'checking'|'free'|'taken'|'invalid'|'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [retry, setRetry] = useState(0)
  const [created, setCreated] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  function say(m: string){ setToast(m); setTimeout(()=>setToast(''),2400) }

  // Live availability check (debounced)
  useEffect(() => {
    const s = slug.trim().toLowerCase()
    if (!s) { setStatus('idle'); return }
    if (!SLUG_RE.test(s)) { setStatus('invalid'); return }
    setStatus('checking')
    const t = setTimeout(async () => {
      const { data, error } = await supabase.from('onetime_rooms').select('slug').eq('slug', s).maybeSingle()
      // A failed lookup is not an available name — say so instead of guessing
      if (error) { setErrMsg(describeError(error)); setStatus('error'); return }
      setStatus(data ? 'taken' : 'free')
    }, 450)
    return () => clearTimeout(t)
  }, [slug, retry]) // eslint-disable-line

  const link = `${SITE_URL}/once/${slug.trim().toLowerCase()}`
  const shareText = `💨 Join my one-time Mivloc chat — it vanishes forever when either of us leaves: ${link}`

  async function create() {
    const s = slug.trim().toLowerCase()
    if (!SLUG_RE.test(s) || status !== 'free') return
    setBusy(true)
    const { error } = await supabase.from('onetime_rooms').insert({ slug: s, creator: nick.trim() || 'anonymous' })
    setBusy(false)
    if (error) {
      // 23505 = unique_violation: someone grabbed the name between the check and the insert
      if (error.code === '23505') { setStatus('taken'); return }
      setErrMsg(describeError(error)); setStatus('error'); return
    }
    sessionStorage.setItem(`sc_once_nick_${s}`, nick.trim() || 'Creator')
    setCreated(true)
  }

  return (
    <main className="bg-orbs min-h-screen flex items-center justify-center px-4 py-10">
      <ThemeToggle />
      <div className="card p-7 max-w-md w-full">
        {!created ? (<>
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">💨</div>
            <h1 className="text-lg font-bold">Create a one-time chat</h1>
            <p className="text-xs text-skyl mt-1 leading-relaxed">
              Name your own link — share it on WhatsApp, SMS, or just say it out loud.
              The moment either person leaves, the chat is deleted. Lost in space.
            </p>
          </div>

          <label className="label">Choose your link name</label>
          <div className="flex items-center gap-0 mb-1">
            <span className="px-3 py-3 rounded-l-xl bg-navy2 border border-r-0 border-sky/20 text-xs text-skyl/60 font-mono whitespace-nowrap">mivloc.online/once/</span>
            <input className="input !rounded-l-none font-mono" value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="my-secret-room" autoFocus />
          </div>
          <div className="min-h-5 text-[11px] mb-2 leading-snug">
            {status === 'checking' && <span className="text-skyl/60">Checking availability…</span>}
            {status === 'free'     && <span className="text-mint">✓ Available — this link is yours</span>}
            {status === 'taken'    && <span className="text-red-400">✗ Taken right now — try another name</span>}
            {status === 'invalid'  && <span className="text-amber-400">3–32 chars: lowercase letters, numbers, hyphens</span>}
            {status === 'error'    && <span className="text-red-400">⚠ {errMsg}{' '}
              <button type="button" className="underline" onClick={() => setRetry((r) => r + 1)}>Retry</button></span>}
          </div>
          <button className="text-[11px] text-skyl/60 underline mb-4" type="button"
            onClick={() => setSlug(randomSuggestion())}>🎲 Suggest a name for me</button>

          <label className="label">Your display name in the chat (optional)</label>
          <input className="input mb-5" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Anonymous" maxLength={24} />

          <button className="btn-primary w-full py-3" onClick={create} disabled={busy || status !== 'free'}>
            {busy ? 'Creating…' : '💨 Create vanishing chat'}
          </button>
          <p className="text-center text-xs text-skyl/50 mt-4"><Link href="/">← mivloc.online</Link></p>
        </>) : (<>
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">✅</div>
            <h1 className="text-lg font-bold">Your one-time chat is live</h1>
            <p className="text-xs text-skyl mt-1">Share it, then enter the room. It vanishes when anyone leaves.</p>
          </div>
          <div className="bg-navy2/80 border border-mint/30 rounded-xl px-4 py-3 font-mono text-xs text-mint break-all mb-4 text-center">{link}</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <a className="btn-ghost !py-2 text-xs" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>📱 WhatsApp</a>
            <a className="btn-ghost !py-2 text-xs" href={`sms:?body=${encodeURIComponent(shareText)}`}>💬 SMS</a>
            <button className="btn-ghost !py-2 text-xs" onClick={() => { navigator.clipboard.writeText(link); say('📋 Copied') }}>📋 Copy</button>
          </div>
          <button className="btn-primary w-full py-3" onClick={() => router.push(`/once/${slug.trim().toLowerCase()}`)}>
            Enter the room →
          </button>
        </>)}
        {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-card border border-mint/40 text-sm shadow-xl">{toast}</div>}
      </div>
    </main>
  )
}
