'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import type { Profile } from '@/types'

export default function ProfileModal({ me, onClose, onSaved }: {
  me: Profile
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = supabaseBrowser()
  const [name, setName] = useState(me.display_name)
  const [phone, setPhone] = useState(me.phone ?? '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true); setErr('')
    const { error } = await supabase.from('profiles')
      .update({ display_name: name.trim() || me.display_name, phone: phone.trim() || null })
      .eq('id', me.id)
    setBusy(false)
    if (error) setErr('Could not save — try again')
    else { onSaved(); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card p-6 max-w-sm w-full">
        <h2 className="font-bold mb-4">⚙️ Account settings</h2>
        <div className="space-y-3">
          <div><label className="label">Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">Email (verified)</label><input className="input opacity-60" value={me.email} readOnly /></div>
          <div><label className="label">Mobile number (optional)</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
          <div>
            <label className="label">Your username <span className="text-skyl/50">(friends message you with this)</span></label>
            <input className="input opacity-60 font-mono" value={me.username ? `@${me.username}` : me.referral_code} readOnly />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button className="btn-primary w-full" onClick={save} disabled={busy}>{busy ? 'Saving…' : '💾 Save changes'}</button>
        </div>
      </div>
    </div>
  )
}
