import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Mivloc handles your data: messages are stored only as AES-256 ciphertext we cannot read, chat codes never leave your device, and there are no ad trackers.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy — Mivloc',
    description: 'Messages are stored only as ciphertext we cannot read. Chat codes never leave your device. No ad trackers.',
    url: '/privacy',
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="11 July 2026">
      <h2>1. Our promise in one paragraph</h2>
      <p>
        Mivloc was built so that your conversations stay yours. Messages are encrypted on your device with
        AES-256 before they reach us, our servers store <strong>only ciphertext</strong>, and the secret
        codes that unlock your chats never leave your device. We cannot read your messages — by design.
        We run no advertising trackers and no third-party analytics. This policy explains the small amount
        of data we do handle, and why.
      </p>

      <h2>2. Data we collect</h2>
      <ul>
        <li><strong>Account details</strong> — your display name, email address (verified at signup), username, and an optional phone number if you choose to add one.</li>
        <li><strong>Encrypted message content</strong> — messages are stored only as base64-encoded AES-GCM-256 ciphertext. Without the code you set on your device, this data is unreadable to us and to anyone else.</li>
        <li><strong>Connection metadata</strong> — basic records needed to run a messaging service: who your accepted contacts are, when a chat room exists, and message timestamps.</li>
        <li><strong>Referral code</strong> — if you sign up through a friend&rsquo;s invite link, their referral code is kept in your browser and linked to your account at signup so we can connect you.</li>
        <li><strong>Server logs</strong> — like nearly every website, our infrastructure keeps short-lived technical logs (such as IP address and request time) for security and debugging.</li>
      </ul>

      <h2>3. Data we do not collect</h2>
      <ul>
        <li>We never see or store your chat unlock codes — they are turned into encryption keys locally on your device.</li>
        <li>We do not store readable message content, and messages in one-time chats are deleted the moment either person leaves.</li>
        <li>We use no advertising networks, no ad trackers, and no third-party analytics scripts.</li>
        <li>We do not sell, rent, or trade your personal data to anyone.</li>
      </ul>

      <h2>4. How we use your data</h2>
      <ul>
        <li>to create and secure your account and verify your email;</li>
        <li>to deliver encrypted messages between you and your contacts;</li>
        <li>to connect you with the friend whose invite link you used;</li>
        <li>to protect the Service against abuse, spam, and security incidents;</li>
        <li>to comply with legal obligations where genuinely required.</li>
      </ul>

      <h2>5. Where your data lives</h2>
      <p>
        Mivloc runs on the following infrastructure providers, which act as data processors on our behalf:
      </p>
      <ul>
        <li><strong>Supabase</strong> — authentication and database hosting (account details and encrypted message data).</li>
        <li><strong>Contabo</strong> — the virtual server that serves the Mivloc website.</li>
        <li><strong>Google Fonts</strong> — the Poppins typeface is loaded from Google&rsquo;s servers, which means your browser sends your IP address to Google when the page loads.</li>
      </ul>

      <h2>6. Cookies and local storage</h2>
      <p>
        Mivloc uses only essential cookies (to keep you signed in) and a small amount of browser local
        storage (your theme choice and, temporarily, a referral code). Details are in our{' '}
        <Link href="/cookies">Cookie Policy</Link>.
      </p>

      <h2>7. How long we keep data</h2>
      <ul>
        <li><strong>One-time chats</strong> — deleted permanently the moment either participant leaves.</li>
        <li><strong>Regular chats</strong> — stored as ciphertext until you delete them or your account.</li>
        <li><strong>Account details</strong> — kept while your account exists.</li>
        <li><strong>Server logs</strong> — kept briefly for security, then rotated out.</li>
      </ul>

      <h2>8. Your rights</h2>
      <p>
        You can ask us at any time to access, correct, or delete the personal data we hold about you
        (your account details — remember that message content is unreadable to us either way). Depending
        on where you live, you may have additional rights under laws such as India&rsquo;s DPDP Act or the
        EU GDPR. To exercise any right, email{' '}
        <a href="mailto:support@mivloc.online">support@mivloc.online</a> from your registered address and
        we will respond as quickly as we can. Deleting your account removes your profile and your encrypted
        conversations.
      </p>

      <h2>9. Security</h2>
      <p>
        All traffic to Mivloc is encrypted in transit with TLS (HTTPS). Message content is additionally
        encrypted end-to-end on your device with AES-GCM-256, and the per-chat codes that protect it are
        strengthened with PBKDF2 and never transmitted. No system is perfectly secure, but our
        ciphertext-only design means that even a full breach of our servers would not expose readable
        conversations.
      </p>

      <h2>10. Children</h2>
      <p>
        Mivloc is not directed at children under 13, and we do not knowingly collect data from them. If
        you believe a child under 13 has created an account, contact us and we will delete it.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        If we change this policy, we will update the &ldquo;Last updated&rdquo; date above. Material
        changes will be highlighted on the website. Continued use of the Service after changes take effect
        means you accept the revised policy.
      </p>

      <h2>12. Contact</h2>
      <p>
        Privacy questions or requests: <a href="mailto:support@mivloc.online">support@mivloc.online</a>.
      </p>
    </LegalPage>
  )
}
