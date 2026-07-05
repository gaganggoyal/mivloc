import type { Metadata, Viewport } from 'next'
import './globals.css'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://safechat.live'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'SafeChat - India\'s Most Secure Chat App | Auto-Encrypt in 60s',
    template: '%s | SafeChat',
  },
  description:
    'SafeChat - India\'s safest messaging app with auto-encryption in 60 seconds. Password-protected conversations. One-time anonymous chats that vanish. Your safety, our priority.',
  keywords: [
    'safe chat', 'secure messaging', 'encrypted chat India', 'self-destructing messages',
    'anonymous chat', 'private messaging', 'safechat', 'one time chat link',
    'password protected chat', 'disappearing messages app',
  ],
  authors: [{ name: 'SafeChat' }],
  robots: { index: true, follow: true },
  alternates: { canonical: SITE },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'SafeChat - Chat Safely. Stay Protected.',
    description:
      'India\'s safest chat app. Messages auto-encrypt in 60s. Password-protected chats. One-time links that vanish when anyone leaves.',
    url: SITE,
    siteName: 'SafeChat',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeChat - Safe & Secure Messaging',
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
  name: 'SafeChat',
  applicationCategory: 'CommunicationApplication',
  operatingSystem: 'Web, Android',
  description: 'Secure messaging with 60-second auto-encryption, password-protected chats and one-time vanishing chat links.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
