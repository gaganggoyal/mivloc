import type { Metadata } from 'next'

// The live ephemeral room itself is not indexable — only the /once creator page is.
export const metadata: Metadata = {
  title: 'One-Time Chat Room',
  robots: { index: false, follow: false },
}

export default function OnceRoomLayout({ children }: { children: React.ReactNode }) {
  return children
}
