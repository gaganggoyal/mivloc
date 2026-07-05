'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser, SITE_URL } from '@/lib/supabase'

function AuthInner() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = supabaseBrowser()

  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [ref, setRef] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    // Referral code captured by /invite/[code]
    const saved = localStorage.getItem('sc_ref')
    if (saved) setRef(saved)
    if (params.get('error') === 'verify') setErr('Verification failed or link expired. Try signing in.')
    // Already signed in? go to dashboard
    supabase.auth.getUser().then(({ data }) => { if (data.user) router.replace('/dashboard') })
  }, []) // eslint-disable-line

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your name')
        if (password.length < 6) throw new Error('Password must be at least 6 characters')
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${SITE_URL}/auth/callback`,
            data: { display_name: name.trim(), phone: phone.trim(), ref: ref.trim() },
          },
        })
        if (error) throw error
        localStorage.removeItem('sc_ref')
        setSent(true) // → "check your email" screen
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace(params.get('next') || '/dashboard')
      }
    } catch (e: any) {
      setErr(e.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  if (sent) return (
    <div className="card p-8 max-w-md w-full text-center">
      <div className="text-5xl mb-4">📬</div>
      <h1 className="text-xl font-bold mb-2">Verify your email</h1>
      <p className="text-sm text-skyl leading-relaxed mb-6">
        We sent a verification link to <span className="text-mint font-medium">{email}</span>.
        Open it to activate your SafeChat account — then you land straight in your dashboard.
      </p>
      <button className="btn-ghost w-full" onClick={() => setSent(false)}>← Use a different email</button>
    </div>
  )

  return (
    <div className="card p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-sky to-mint flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(14,165,233,.5)]">🛡️</div>
        <h1 className="text-xl font-bold">{mode === 'signup' ? 'Create your SafeChat account' : 'Welcome back'}</h1>
        <p className="text-xs text-skyl mt-1">
          {mode === 'signup' ? 'Verified by email · phone optional' : 'Sign in to your encrypted chats'}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
        )}
        <div>
          <label className="label">Email (will be verified)</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        {mode === 'signup' && (
          <div>
            <label className="label">Mobile number <span className="text-skyl/50">(optional)</span></label>
            <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </div>
        )}
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" required />
        </div>
        {mode === 'signup' && (
          <div>
            <label className="label">Referral code <span className="text-skyl/50">(optional)</span></label>
            <input className="input" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Friend's code — connects you instantly" />
          </div>
        )}
        {err && <p className="text-red-400 text-xs">{err}</p>}
        <button className="btn-primary w-full py-3" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signup' ? '🛡️ Create account' : 'Sign in →'}
        </button>
      </form>

      <p className="text-center text-xs text-skyl mt-5">
        {mode === 'signup' ? 'Already have an account?' : 'New to SafeChat?'}{' '}
        <button className="text-mint font-semibold" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setErr('') }}>
          {mode === 'signup' ? 'Sign in' : 'Create one free'}
        </button>
      </p>
      <p className="text-center text-xs text-skyl/50 mt-3">
        <Link href="/">← Back to safechat.live</Link>
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <main className="bg-orbs min-h-screen flex items-center justify-center px-4 py-10">
      <Suspense><AuthInner /></Suspense>
    </main>
  )
}
