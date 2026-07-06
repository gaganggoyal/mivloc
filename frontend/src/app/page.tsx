import Link from 'next/link'
import WatchDemo from '@/components/WatchDemo'

const FEATURES = [
  { icon: '⏱️', title: 'Auto-encrypt in 60 seconds', desc: 'Every conversation dissolves into AES-256 ciphertext after one minute of chatting or idle time. Re-enter your chat code to unlock.' },
  { icon: '🔑', title: 'A secret code per friend', desc: 'Before your first message with any friend, you set a code just for them. It never leaves your device — it becomes the encryption key.' },
  { icon: '💨', title: 'One-time chats that vanish', desc: 'Create a link with a name you choose, share it anywhere. The moment either person leaves, the chat is deleted — lost in space.' },
  { icon: '🔗', title: 'Invite links', desc: 'Share your personal link on WhatsApp, SMS or email. Friends who join through it are connected to you automatically.' },
  { icon: '✉️', title: 'Verified accounts', desc: 'Every account is verified by email before the first message. Phone number stays optional — your choice.' },
  { icon: '🇮🇳', title: 'Built for India', desc: 'Light on data, fast on any phone, installable from Play Store or straight from the browser.' },
]

export default function Landing() {
  return (
    <div className="bg-orbs">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-navy/85 backdrop-blur-xl border-b border-sky/20">
        <div className="flex items-center gap-2.5 font-extrabold text-xl">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky to-mint flex items-center justify-center text-xl shadow-[0_0_25px_rgba(14,165,233,.5)]">🛡️</span>
          <span className="bg-gradient-to-r from-mint via-ice to-skyl bg-clip-text text-transparent">Mivloc</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/once" className="btn-ghost hidden sm:inline-flex">One-time chat</Link>
          <Link href="/auth/login" className="btn-primary">Sign in</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[calc(100vh-70px)] flex items-center justify-center px-6 py-16 text-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-mint/30 bg-mint/10 text-mint text-sm">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            Messages lock themselves in 60 seconds
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-5">
            <span className="bg-gradient-to-r from-mint via-ice to-sky bg-clip-text text-transparent">
              Chat Safely.<br />Stay Protected.
            </span>
          </h1>
          <p className="text-skyl text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
            End-to-end encrypted chats with a secret code for every friend, and
            one-time conversations that vanish the moment anyone leaves.
            Nothing readable is ever stored.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <Link href="/auth/login" className="btn-primary text-base px-7 py-3.5">🛡️ Create free account</Link>
            <Link href="/once" className="btn-ghost text-base px-7 py-3.5">💨 Try a one-time chat</Link>
          </div>
          <WatchDemo />
          <p className="mt-6 text-xs text-skyl/50">Free forever · Email verified · No phone number required</p>
        </div>
      </section>

      {/* The 60s lock — signature explainer */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto card p-8 text-center">
          <div className="text-xs tracking-[0.2em] text-mint font-semibold mb-3">HOW THE 60-SECOND LOCK WORKS</div>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-2xl mb-2">💬</div>
              <div className="font-semibold mb-1 text-sm">You chat normally</div>
              <p className="text-xs text-skyl/80 leading-relaxed">Messages are encrypted on your device before they leave it. The server only ever stores ciphertext.</p>
            </div>
            <div>
              <div className="text-2xl mb-2">⏱️</div>
              <div className="font-semibold mb-1 text-sm">60 seconds pass</div>
              <p className="text-xs text-skyl/80 leading-relaxed">After a minute of chatting or idling, the conversation on screen dissolves back into unreadable ciphertext.</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔑</div>
              <div className="font-semibold mb-1 text-sm">Your code unlocks it</div>
              <p className="text-xs text-skyl/80 leading-relaxed">Only the secret code you set for that friend can decrypt the chat again. We never see or store it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <h2 className="text-center text-2xl sm:text-3xl font-bold mb-10">
          Everything a <span className="text-mint">safe chat</span> should be
        </h2>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 hover:border-mint/40 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-semibold mb-1.5">{f.title}</div>
              <p className="text-sm text-skyl/80 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 text-center">
        <div className="max-w-2xl mx-auto card p-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Your safety, our priority.</h2>
          <p className="text-skyl mb-6 text-sm">Create your account in under a minute. Invite one friend. Chat like nobody's watching — because nobody is.</p>
          <Link href="/auth/login" className="btn-primary text-base px-8 py-3.5">Get started free →</Link>
        </div>
      </section>

      <footer className="border-t border-sky/10 px-6 py-8 text-center text-xs text-skyl/50">
        <p>🛡️ Mivloc · mivloc.online · Chat Safely. Stay Protected.</p>
        <p className="mt-1">End-to-end encrypted · Messages auto-lock in 60s · One-time chats vanish forever</p>
      </footer>
    </div>
  )
}
