'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * "How to use SafeChat" — an auto-playing animated walkthrough, story-style:
 * six scenes on a loop with a progress bar. Tap to pause/resume.
 * With sound=true each scene is narrated aloud using the browser's built-in
 * voice (starts only after a user click, per browser autoplay rules).
 */
const SCENES = [
  { id: 'signup', title: 'Create your account', caption: 'Sign up with your email — we verify it before your first chat. Phone number optional.', ms: 4000 },
  { id: 'invite', title: 'Share your invite link', caption: 'Send your personal link on WhatsApp or SMS. Friends who join are connected automatically.', ms: 4000 },
  { id: 'code', title: 'Set YOUR secret code', caption: 'Any code you like — even one digit. Your friend picks their own. Nobody shares anything.', ms: 4000 },
  { id: 'chat', title: 'Chat freely', caption: 'Every message is encrypted on your device before it leaves it.', ms: 4500 },
  { id: 'lock', title: '60 seconds later — it locks itself', caption: 'The whole conversation dissolves into ciphertext. Only your code opens it again.', ms: 4500 },
  { id: 'once', title: 'One-time chats vanish', caption: 'Make a link with any name, chat with anyone — when someone leaves, it’s lost in space.', ms: 4500 },
]

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export default function DemoVideo({ sound = false }: { sound?: boolean }) {
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(!sound)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  // Chrome loads voices asynchronously — collect them as they arrive.
  useEffect(() => {
    if (!canSpeak()) return
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices() }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  // Best available English voice; requesting an absent one silences Chrome.
  function pickVoice(): SpeechSynthesisVoice | null {
    const vs = voicesRef.current
    return vs.find(v => v.lang === 'en-IN')
      ?? vs.find(v => v.lang?.startsWith('en') && v.default)
      ?? vs.find(v => v.lang?.startsWith('en'))
      ?? null
  }

  useEffect(() => {
    if (!playing) { if (canSpeak()) window.speechSynthesis.cancel(); return }
    const s = SCENES[i]
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const go = () => { if (!cancelled) { cancelled = true; setI((v) => (v + 1) % SCENES.length) } }

    if (sound && !muted && canSpeak()) {
      const u = new SpeechSynthesisUtterance(`Step ${i + 1}. ${s.title}. ${s.caption}`)
      u.rate = 1.05
      // Advance ONLY when narration truly finishes. A cancelled utterance
      // fires onerror — advancing from there causes premature scene skips.
      u.onend = () => { if (!cancelled) timers.push(setTimeout(go, 600)) }
      window.speechSynthesis.cancel()
      // Brief pause after cancel() — Chrome swallows speak() called right after it
      timers.push(setTimeout(() => {
        if (cancelled) return
        const v = pickVoice()
        if (v) { u.voice = v; u.lang = v.lang }
        window.speechSynthesis.speak(u)
        window.speechSynthesis.resume() // Chrome sometimes starts paused
      }, 150))
      timers.push(setTimeout(go, 20000)) // safety net if the engine stalls
    } else {
      timers.push(setTimeout(go, s.ms))
    }
    return () => { cancelled = true; timers.forEach(clearTimeout); if (canSpeak()) window.speechSynthesis.cancel() }
  }, [i, playing, muted, sound])

  const s = SCENES[i]

  return (
    <div className="max-w-sm mx-auto select-none cursor-pointer" onClick={() => setPlaying(p => !p)} title={playing ? 'Tap to pause' : 'Tap to play'}>
      {/* Phone frame */}
      <div className="rounded-[2rem] border border-sky/25 bg-navy2/80 backdrop-blur-xl shadow-[0_10px_60px_rgba(14,165,233,.25)] overflow-hidden">
        {/* Story progress bar */}
        <div className="flex gap-1 px-4 pt-3">
          {SCENES.map((sc, idx) => {
            const barMs = sound && !muted ? sc.ms * 2.3 : sc.ms // narration is slower than the silent timer
            return (
              <div key={sc.id} className="h-1 flex-1 rounded-full bg-sky/20 overflow-hidden">
                <div className="h-full bg-mint rounded-full"
                  style={idx < i ? { width: '100%' } :
                    idx === i && playing ? { width: '100%', transition: `width ${barMs}ms linear` } :
                    idx === i ? { width: '50%' } : { width: '0%' }} />
              </div>
            )
          })}
        </div>

        {/* Scene stage */}
        <div className="h-72 px-5 py-4 flex flex-col items-center justify-center text-center" key={s.id}>
          {s.id === 'signup' && (
            <div className="w-full space-y-2 demo-in">
              <div className="text-4xl mb-2">🛡️</div>
              <div className="bg-navy/80 border border-sky/20 rounded-xl px-4 py-2.5 text-xs text-skyl text-left">you@example.com</div>
              <div className="bg-navy/80 border border-sky/20 rounded-xl px-4 py-2.5 text-xs text-skyl text-left">••••••••</div>
              <div className="text-mint text-xs pt-1 demo-in-late">✅ Email verified — account active</div>
            </div>
          )}
          {s.id === 'invite' && (
            <div className="w-full space-y-3 demo-in">
              <div className="text-4xl mb-1">🔗</div>
              <div className="bg-navy/80 border border-mint/30 rounded-xl px-3 py-2.5 font-mono text-[10px] text-mint break-all">safechat.live/invite/AB12CD34</div>
              <div className="flex justify-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-mint/15 border border-mint/30 text-mint">📱 WhatsApp</span>
                <span className="px-3 py-1.5 rounded-lg bg-sky/15 border border-sky/30 text-skyl">💬 SMS</span>
              </div>
              <div className="text-mint text-xs demo-in-late">🤝 Priya joined through your link!</div>
            </div>
          )}
          {s.id === 'code' && (
            <div className="w-full space-y-3 demo-in">
              <div className="text-4xl mb-1">🔐</div>
              <p className="text-xs text-skyl">Your code for chats with Priya:</p>
              <div className="bg-navy/80 border border-sky/20 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] text-ice">•••</div>
              <div className="text-[11px] text-skyl/60 demo-in-late">Priya sets her own code on her phone 📱</div>
            </div>
          )}
          {s.id === 'chat' && (
            <div className="w-full space-y-2">
              <div className="flex justify-end demo-in"><span className="bg-gradient-to-br from-sky to-mint text-white text-xs px-3.5 py-2 rounded-2xl rounded-br-md">Hey! This chat is actually private 🤫</span></div>
              <div className="flex justify-start demo-in-late"><span className="bg-card border border-sky/15 text-xs px-3.5 py-2 rounded-2xl rounded-bl-md text-ice">Whoa, and it locks itself in 60s?</span></div>
              <div className="flex justify-end demo-in-later"><span className="bg-gradient-to-br from-sky to-mint text-white text-xs px-3.5 py-2 rounded-2xl rounded-br-md">Watch… ⏱️</span></div>
            </div>
          )}
          {s.id === 'lock' && (
            <div className="w-full space-y-2 demo-in">
              <div className="flex justify-end"><span className="bg-navy/80 border border-red-500/25 text-[9px] font-mono px-3.5 py-2 rounded-2xl text-skyl/40 break-all">kJ8s2mQx91bZ0vTqLwEr7yUiOp…</span></div>
              <div className="flex justify-start"><span className="bg-navy/80 border border-red-500/25 text-[9px] font-mono px-3.5 py-2 rounded-2xl text-skyl/40 break-all">Xw3nD6fGh0jKl5aScVbN8mQz…</span></div>
              <div className="text-red-300 text-xs pt-2">🔒 Conversation locked</div>
              <div className="text-[11px] text-skyl/60 demo-in-late">Enter your code to read it again</div>
            </div>
          )}
          {s.id === 'once' && (
            <div className="w-full space-y-3 demo-in">
              <div className="text-4xl">💨</div>
              <div className="bg-navy/80 border border-mint/30 rounded-xl px-3 py-2 font-mono text-[10px] text-mint">safechat.live/once/our-secret-room</div>
              <div className="text-xs text-skyl">Someone left the chat…</div>
              <div className="text-xl demo-in-late">🌌 <span className="text-sm text-skyl/70">Lost in space. Nothing was ever stored.</span></div>
            </div>
          )}
        </div>

        {/* Caption bar */}
        <div className="px-5 pb-5 text-center relative">
          <div className="text-sm font-semibold text-ice mb-1">{i + 1}. {s.title}</div>
          <p className="text-xs text-skyl/80 leading-relaxed min-h-[2.5rem]">{s.caption}</p>
          {sound && (
            <button className="absolute right-4 bottom-4 text-lg" title={muted ? 'Unmute narration' : 'Mute narration'}
              onClick={(e) => { e.stopPropagation(); setMuted(m => !m) }}>
              {muted ? '🔇' : '🔊'}
            </button>
          )}
        </div>
      </div>
      <p className="text-center text-[11px] text-skyl/50 mt-3">{playing ? '▶ Playing — tap to pause' : '⏸ Paused — tap to play'}</p>
    </div>
  )
}
