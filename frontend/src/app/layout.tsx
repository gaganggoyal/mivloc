import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'
import { FAQ } from '@/lib/faq'

// Runs before first paint so the saved theme is applied with no flash of the
// wrong colors. Falls back to the OS preference when nothing is saved yet.
const themeInit = `(function(){try{var t=localStorage.getItem('mv_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mivloc.online'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Mivloc — World\'s Safest Secret Chat App | Auto-Encrypt in 60s',
    template: '%s | Mivloc — Safe Secret Chat',
  },
  description:
    'Mivloc is the world\'s safest secret chat app. Messages auto-encrypt into AES-256 ciphertext in 60 seconds, every friend gets a private secret code, and one-time chats vanish forever the moment anyone leaves. Free, email-verified, no phone number required.',
  applicationName: 'Mivloc',
  keywords: [
    'safe chat', 'secret chat', 'secure messaging app', 'encrypted chat', 'end-to-end encrypted chat',
    'self-destructing messages', 'disappearing messages app', 'anonymous chat', 'private messaging',
    'mivloc', 'one time chat link', 'password protected chat', 'vanishing messages',
    'secret messaging app', 'safest chat app', 'private chat online', 'encrypted messenger',
    'confidential chat', 'AES-256 chat', 'no trace chat',
  ],
  authors: [{ name: 'Mivloc', url: SITE }],
  creator: 'Mivloc',
  publisher: 'Mivloc',
  category: 'Communication',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: '/' },
  manifest: '/manifest.json',
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    title: 'Mivloc',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Mivloc — World\'s Safest Secret Chat App',
    description:
      'The safest secret chat on the internet. Messages auto-encrypt in 60s, a secret code for every friend, and one-time chats that vanish the moment anyone leaves.',
    url: SITE,
    siteName: 'Mivloc',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mivloc — World\'s Safest Secret Chat App',
    description: 'Chat safely. Messages auto-encrypt in 60s. A secret code for every friend. One-time chats vanish forever.',
    creator: '@mivloc',
  },
  verification: {
    // Add your verification tokens here once you claim the property:
    // google: 'your-google-site-verification-token',
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
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Mivloc',
      url: SITE,
      logo: `${SITE}/icons/icon-512.png`,
      description: 'Mivloc is the world\'s safest secret chat app — messages auto-encrypt in 60 seconds and one-time chats vanish forever.',
      sameAs: [] as string[],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: 'Mivloc',
      description: 'World\'s safest secret chat app. Auto-encrypt in 60 seconds, a secret code for every friend, one-time vanishing chats.',
      publisher: { '@id': `${SITE}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE}/#app`,
      name: 'Mivloc',
      applicationCategory: 'CommunicationApplication',
      operatingSystem: 'Web, Android, iOS',
      url: SITE,
      description: 'Secure secret messaging with 60-second AES-256 auto-encryption, a private secret code for every friend, and one-time chat links that vanish the moment anyone leaves.',
      publisher: { '@id': `${SITE}/#organization` },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Auto-encrypt every chat in 60 seconds',
        'A private secret code for each friend',
        'One-time chats that vanish forever',
        'End-to-end AES-256 encryption',
        'Email-verified accounts, no phone number required',
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE}/#faq`,
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
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
