import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'One-Time Secret Chat — Vanishes When Anyone Leaves',
  description:
    'Create a free one-time secret chat link in seconds. Pick any name, share it anywhere, and the whole conversation is permanently deleted the moment either person leaves. No account, no history, no trace.',
  alternates: { canonical: '/once' },
  openGraph: {
    title: 'One-Time Secret Chat — Mivloc',
    description:
      'Create a disappearing one-time chat link. It vanishes forever the moment anyone leaves. No account needed.',
    url: '/once',
    type: 'website',
  },
}

export default function OnceLayout({ children }: { children: React.ReactNode }) {
  return children
}
