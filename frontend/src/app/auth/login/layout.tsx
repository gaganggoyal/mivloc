import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In or Create Your Free Secret Chat Account',
  description:
    'Create your free Mivloc account in under a minute with just an email — no phone number required. Start chatting on the world\'s safest secret chat app, where messages auto-encrypt in 60 seconds.',
  alternates: { canonical: '/auth/login' },
  openGraph: {
    title: 'Sign In or Sign Up — Mivloc',
    description:
      'Create your free, email-verified secret chat account in under a minute. No phone number required.',
    url: '/auth/login',
    type: 'website',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
