import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that govern your use of Mivloc — the secret chat app with 60-second auto-encryption and one-time vanishing chats.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service — Mivloc',
    description: 'The terms that govern your use of Mivloc.',
    url: '/terms',
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="11 July 2026">
      <h2>1. Agreement to these terms</h2>
      <p>
        Welcome to Mivloc. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
        Mivloc website and messaging service at <strong>mivloc.online</strong> (the &ldquo;Service&rdquo;).
        By creating an account, starting a one-time chat, or otherwise using the Service, you agree to be
        bound by these Terms and by our <Link href="/privacy">Privacy Policy</Link>. If you do not agree,
        please do not use the Service.
      </p>

      <h2>2. What Mivloc is</h2>
      <p>
        Mivloc is a private messaging service. Messages are encrypted on your device with AES-256 before
        they are sent, conversations automatically lock into unreadable ciphertext after 60 seconds, and
        one-time chats are permanently deleted the moment either participant leaves. The unlock codes you
        set never leave your device.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 13 years old to use Mivloc. If you are under 18, you may use the Service only
        with the consent and supervision of a parent or legal guardian who agrees to these Terms on your
        behalf. By using the Service you represent that you meet these requirements.
      </p>

      <h2>4. Your account</h2>
      <ul>
        <li>Accounts require a valid email address, which must be verified before your first message. A phone number is optional.</li>
        <li>Only one account is allowed per email address.</li>
        <li>You are responsible for everything that happens under your account. Keep your sign-in credentials confidential.</li>
        <li>You agree to provide accurate information and to keep it up to date.</li>
      </ul>

      <h2>5. Encryption codes and lost access</h2>
      <p>
        Mivloc is designed so that we <strong>cannot</strong> read your messages: the secret codes you set
        for each friend are used as encryption keys and never leave your device. This has an important
        consequence — <strong>if you forget a chat code, neither you nor Mivloc can recover that
        conversation</strong>. Encrypted content without its code is permanently unreadable, and you accept
        this as an inherent feature of the Service, not a defect.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>break any applicable law or regulation, or encourage others to do so;</li>
        <li>harass, threaten, defame, or abuse any person, or share content that exploits or endangers minors;</li>
        <li>send spam, malware, phishing links, or unsolicited commercial messages;</li>
        <li>impersonate any person or misrepresent your affiliation with anyone;</li>
        <li>attempt to probe, disrupt, overload, reverse-engineer, or gain unauthorized access to the Service or other users&rsquo; accounts;</li>
        <li>resell or commercially exploit the Service without our written permission.</li>
      </ul>
      <p>
        Although message content is encrypted and unreadable to us, we may act on user reports and on
        non-content signals (such as spam patterns) and may suspend or terminate accounts that we
        reasonably believe violate these Terms.
      </p>

      <h2>7. One-time chats</h2>
      <p>
        One-time chats are deleted permanently and irreversibly the moment either participant leaves the
        room. There is no history, no archive, and no way to restore a one-time chat once it ends. Do not
        use one-time chats for anything you may need to keep.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The Mivloc name, logo, design, and software are owned by Mivloc and protected by applicable
        intellectual-property laws. We grant you a limited, non-exclusive, non-transferable, revocable
        licence to use the Service for personal, non-commercial purposes. You retain all rights to the
        content of your own messages.
      </p>

      <h2>9. Service availability and changes</h2>
      <p>
        The Service is provided free of charge and on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
        basis. We may add, change, suspend, or discontinue any part of the Service at any time. We do not
        guarantee that the Service will be uninterrupted, error-free, or available at all times.
      </p>

      <h2>10. Disclaimer of warranties</h2>
      <p>
        To the maximum extent permitted by law, Mivloc disclaims all warranties, express or implied,
        including warranties of merchantability, fitness for a particular purpose, and non-infringement.
        You use the Service at your own risk.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Mivloc and its operators shall not be liable for any
        indirect, incidental, special, consequential, or punitive damages, or for any loss of data,
        messages, profits, or goodwill, arising out of or relating to your use of (or inability to use)
        the Service — including loss of access to conversations caused by forgotten codes or the automatic
        deletion of one-time chats.
      </p>

      <h2>12. Termination</h2>
      <p>
        You may stop using Mivloc at any time. We may suspend or terminate your access immediately if you
        breach these Terms or if we are required to do so by law. Sections 8, 10, 11, and 13 survive
        termination.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of India, without regard to conflict-of-law principles. Any
        disputes shall be subject to the exclusive jurisdiction of the courts of India.
      </p>

      <h2>14. Changes to these terms</h2>
      <p>
        We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top shows
        the latest revision, and continued use of the Service after changes take effect means you accept
        the revised Terms.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms? Email us at <a href="mailto:support@mivloc.online">support@mivloc.online</a>.
      </p>
    </LegalPage>
  )
}
