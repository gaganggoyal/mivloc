'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

/**
 * Friend opens https://mivloc.online/invite/AB12CD34
 * → we remember the code, send them to signup.
 * → the database trigger auto-friends them with the inviter after verification.
 */
export default function InvitePage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()

  useEffect(() => {
    if (code) localStorage.setItem('sc_ref', String(code))
    const t = setTimeout(() => router.replace('/auth/login'), 1400)
    return () => clearTimeout(t)
  }, [code, router])

  return (
    <main className="bg-orbs min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">🤝</div>
        <h1 className="text-lg font-bold mb-2">You&apos;ve been invited to Mivloc</h1>
        <p className="text-sm text-skyl">
          Invite code <span className="text-mint font-mono font-semibold">{code}</span> saved.
          Taking you to sign-up — you&apos;ll be connected to your friend automatically.
        </p>
      </div>
    </main>
  )
}
