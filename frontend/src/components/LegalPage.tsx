import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'
import ThemeToggle from '@/components/ThemeToggle'

/** Shared shell for the terms / privacy / cookies pages. */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-orbs min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-navy/85 backdrop-blur-xl border-b border-sky/20">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky to-mint flex items-center justify-center text-xl shadow-[0_0_25px_rgba(14,165,233,.5)]">🛡️</span>
            <span className="bg-gradient-to-r from-mint via-ice to-skyl bg-clip-text text-transparent">Mivloc</span>
          </Link>
          <ThemeToggle variant="inline" />
        </div>
        <Link href="/auth/login" className="btn-primary">Sign in</Link>
      </nav>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{title}</h1>
        <p className="text-xs text-skyl/60 mb-8">Last updated: {updated}</p>
        <div className="card p-6 sm:p-9 legal">{children}</div>
      </main>

      <SiteFooter />
    </div>
  )
}
