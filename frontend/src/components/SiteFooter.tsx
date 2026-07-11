import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="border-t border-sky/10 px-6 py-8 text-center text-xs text-skyl/50">
      <p>🛡️ Mivloc · mivloc.online · Chat Safely. Stay Protected.</p>
      <p className="mt-1">End-to-end encrypted · Messages auto-lock in 60s · One-time chats vanish forever</p>
      <p className="mt-3 space-x-3">
        <Link href="/terms" className="hover:text-mint transition-colors">Terms of Service</Link>
        <span aria-hidden>·</span>
        <Link href="/privacy" className="hover:text-mint transition-colors">Privacy Policy</Link>
        <span aria-hidden>·</span>
        <Link href="/cookies" className="hover:text-mint transition-colors">Cookie Policy</Link>
      </p>
    </footer>
  )
}
