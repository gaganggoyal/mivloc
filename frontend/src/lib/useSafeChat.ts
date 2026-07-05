'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser, SITE_URL } from '@/lib/supabase'
import type { Profile } from '@/types'

/** Loads the signed-in user, their friends and chat ids; shared by
 *  the sidebar and the dashboard so the logic lives in one place. */
export function useSafeChat() {
  const supabase = supabaseBrowser()
  const router = useRouter()
  const [me, setMe] = useState<Profile | null>(null)
  const [friends, setFriends] = useState<Profile[]>([])
  const [chatByFriend, setChatByFriend] = useState<Record<string, string>>({})
  const [dbErr, setDbErr] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/login'); return }
    setDbErr('')
    let { data: prof, error: profErr } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (profErr) { setDbErr(`Could not load your profile: ${profErr.message}`); setLoading(false); return }
    if (!prof) {
      // Self-heal: the DB trigger normally creates this row at signup.
      const meta = user.user_metadata ?? {}
      const { data: created, error: createErr } = await supabase.from('profiles').insert({
        id: user.id,
        display_name: meta.display_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: meta.phone || null,
      }).select().maybeSingle()
      if (createErr) { setDbErr(`Could not create your profile: ${createErr.message}`); setLoading(false); return }
      prof = created
      if (prof && meta.ref) {
        const { data: inviter } = await supabase.from('profiles')
          .select('id').eq('referral_code', meta.ref).maybeSingle()
        if (inviter && inviter.id !== user.id) {
          const [a, b] = [inviter.id, user.id].sort()
          await supabase.from('friendships').insert({ user_a: a, user_b: b }) // dup errors are fine
        }
      }
    }
    if (prof) setMe(prof)

    const { data: fr } = await supabase.from('friendships').select('user_a,user_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    const ids = (fr ?? []).map(f => f.user_a === user.id ? f.user_b : f.user_a)
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('*').in('id', ids)
      setFriends(profs ?? [])
    } else setFriends([])

    const { data: myChats } = await supabase.from('chats').select('id,user_a,user_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    const map: Record<string, string> = {}
    for (const c of myChats ?? []) map[c.user_a === user.id ? c.user_b : c.user_a] = c.id
    setChatByFriend(map)
    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(() => { load() }, [load])

  async function openChat(friend: Profile): Promise<boolean> {
    if (!me) return false
    const known = chatByFriend[friend.id]
    if (known) { router.push(`/chat/${known}`); return true }
    const [a, b] = [me.id, friend.id].sort()
    const { data: existing } = await supabase.from('chats').select('id').eq('user_a', a).eq('user_b', b).maybeSingle()
    if (existing) { router.push(`/chat/${existing.id}`); return true }
    const { data: created, error } = await supabase.from('chats').insert({ user_a: a, user_b: b }).select('id').single()
    if (created) { router.push(`/chat/${created.id}`); return true }
    if (error) {
      // Friend may have created it at the same moment — pick up their row.
      const { data: race } = await supabase.from('chats').select('id').eq('user_a', a).eq('user_b', b).maybeSingle()
      if (race) { router.push(`/chat/${race.id}`); return true }
    }
    return false
  }

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const inviteLink = me ? `${SITE_URL}/invite/${me.referral_code}` : ''
  const shareText = `🛡️ Join me on SafeChat — India's safest chat app! Messages auto-encrypt in 60 seconds. Use my link: ${inviteLink}`

  return { me, friends, chatByFriend, dbErr, loading, inviteLink, shareText, openChat, logout, reload: load }
}
