import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Mivloc uses only essential sign-in cookies and minimal local storage — no advertising cookies, no analytics, no tracking.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Cookie Policy — Mivloc',
    description: 'Only essential sign-in cookies and minimal local storage. No ads, no analytics, no tracking.',
    url: '/cookies',
    type: 'website',
  },
}

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="11 July 2026">
      <h2>1. The short version</h2>
      <p>
        Mivloc uses <strong>only essential cookies</strong> — the ones needed to keep you signed in.
        There are no advertising cookies, no analytics cookies, and no cross-site tracking of any kind.
        Because we use nothing beyond what is strictly necessary to run the Service, no cookie consent
        banner is required.
      </p>

      <h2>2. What cookies are</h2>
      <p>
        Cookies are small text files a website stores in your browser so it can remember things between
        page loads — for example, that you are signed in. Similar information can also be kept in your
        browser&rsquo;s &ldquo;local storage&rdquo;, which never leaves your device on its own.
      </p>

      <h2>3. Cookies we use</h2>
      <ul>
        <li>
          <strong>Authentication cookies</strong> (names beginning with <strong>sb-</strong>) — set by our
          authentication provider, Supabase, when you sign in. They hold your encrypted session token so
          you stay signed in between visits. They are essential: without them you would have to sign in on
          every page. They expire or are removed when you sign out.
        </li>
      </ul>
      <p>That is the complete list — there are no others.</p>

      <h2>4. Local storage we use</h2>
      <ul>
        <li><strong>mv_theme</strong> — remembers whether you chose the light or dark theme.</li>
        <li><strong>sc_ref</strong> — if you open a friend&rsquo;s invite link, their referral code is kept here temporarily so we can connect you to them when you sign up. It is removed after signup.</li>
        <li><strong>Chat encryption material</strong> — the cryptographic data that unlocks your chats lives only on your device and is never sent to our servers. This is a core part of Mivloc&rsquo;s security design, described in our <Link href="/privacy">Privacy Policy</Link>.</li>
      </ul>

      <h2>5. Managing cookies</h2>
      <p>
        You can delete or block cookies at any time in your browser settings. Note that blocking the
        authentication cookies will sign you out and make it impossible to stay signed in, and clearing
        local storage on a device can remove chat encryption material stored there — which may make
        conversations unlockable from that device.
      </p>

      <h2>6. Changes and contact</h2>
      <p>
        If our use of cookies ever changes, we will update this page and the &ldquo;Last updated&rdquo;
        date above. Questions: <a href="mailto:support@mivloc.online">support@mivloc.online</a>.
      </p>
    </LegalPage>
  )
}
