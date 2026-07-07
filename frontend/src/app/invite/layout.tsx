import type { Metadata } from 'next'

// Personal invite links are per-user entry points — don't index them.
export const metadata: Metadata = {
  title: 'Join on Mivloc',
  robots: { index: false, follow: false },
}

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children
}
