// Shared FAQ content. Rendered visibly on the landing page AND emitted as
// FAQPage JSON-LD in the root layout — Google requires the structured data to
// match the on-page text, so both must read from this single source.
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'What makes Mivloc the safest secret chat app?',
    a: 'Every message is encrypted on your device with AES-256 before it ever leaves your phone, so the server only ever stores unreadable ciphertext. On top of that, chats auto-lock after 60 seconds and one-time conversations delete themselves the moment anyone leaves. Nothing readable is ever stored.',
  },
  {
    q: 'How does the 60-second auto-encryption work?',
    a: 'After about a minute of chatting or idle time, the conversation on your screen dissolves back into encrypted ciphertext. Only the secret code you set for that friend can unlock it again — and that code never leaves your device.',
  },
  {
    q: 'What is a one-time chat?',
    a: 'A one-time chat is a link you create with any name you choose and share anywhere. Two people join, talk privately, and the instant either person leaves the room the entire chat is permanently deleted — no history, no trace.',
  },
  {
    q: 'Is Mivloc free to use?',
    a: 'Yes. Mivloc is free forever. You can create an account in under a minute using just an email address — no phone number and no payment required.',
  },
  {
    q: 'Do I need to give my phone number?',
    a: 'No. Accounts are verified by email only. Adding a phone number is completely optional and always your choice.',
  },
  {
    q: 'Can Mivloc read my messages?',
    a: 'No. Because messages are encrypted on your device and the secret codes never leave it, we cannot read your conversations. The server only ever holds ciphertext it has no key to.',
  },
]
