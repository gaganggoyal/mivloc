import type { Metadata } from 'next'

// Private encrypted conversations — never index.
export const metadata: Metadata = {
  title: 'Secure Chat',
  robots: { index: false, follow: false },
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children
}
