import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'

// Runs before first paint so the saved theme is applied with no flash of the
// wrong colors. Falls back to the OS preference when nothing is saved yet.
const themeInit = `(function(){try{var t=localStorage.getItem('mv_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mivloc.online'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Mivloc - India\'s Most Secure Chat App | Auto-Encrypt in 60s',
    template: '%s | Mivloc',
  },
  description:
    'Mivloc - India\'s safest messaging app with auto-encryption in 60 seconds. Password-protected conversations. One-time anonymous chats that vanish. Your safety, our priority.',
  keywords: [
    'safe chat', 'secure messaging', 'encrypted chat India', 'self-destructing messages',
    'anonymous chat', 'private messaging', 'mivloc', 'one time chat link',
    'password protected chat', 'disappearing messages app',
  ],
  authors: [{ name: 'Mivloc' }],
  robots: { index: true, follow: true },
  alternates: { canonical: SITE },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Mivloc - Chat Safely. Stay Protected.',
    description:
      'India\'s safest chat app. Messages auto-encrypt in 60s. Password-protected chats. One-time links that vanish when anyone leaves.',
    url: SITE,
    siteName: 'Mivloc',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mivloc - Safe & Secure Messaging',
    description: 'Chat safely. Messages auto-encrypt in 60s. Your safety, our priority.',
  },
}

export const viewport: Viewport = {
  themeColor: '#06152a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Mivloc',
  applicationCategory: 'CommunicationApplication',
  operatingSystem: 'Web, Android',
  description: 'Secure messaging with 60-second auto-encryption, password-protected chats and one-time vanishing chat links.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        {children}
        <ThemeToggle />
      </body>
    </html>
  )
}
