import type { Metadata } from 'next'

// Private, per-user area — keep it out of search indexes entirely.
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
