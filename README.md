# 🛡️ Mivloc — Chat Safely. Stay Protected.

India's safest chat app: messages auto-encrypt in 60 seconds, every friend gets
their own secret code, and one-time chats vanish forever when anyone leaves.

**Live domain:** https://mivloc.online

## Features
| Feature | How it works |
|---|---|
| **Email-verified accounts** | Supabase Auth sends a verification link; the account activates only after clicking it. Phone number is optional. |
| **Unique @usernames** | Every user picks a unique username at signup. Friends can start an encrypted chat just by typing `@username` — no link needed. The username is also your referral/invite handle. |
| **Invite links** | Every user gets `mivloc.online/invite/USERNAME`. Friends who sign up through it are auto-connected — a DB trigger creates the friendship. |
| **Your own code per chat** | Each person chooses their **own** unlock code for every chat (any length — even one digit). PBKDF2 (100k iterations) verifies it on-device; the server stores only a salt + verification blob — never the code. |
| **Encrypted storage** | Every chat has a random AES-GCM-256 key; messages are encrypted client-side and the database only ever contains `base64(iv‖ciphertext)`. |
| **60-second auto-lock** | After 1 minute of chatting or idle, the conversation dissolves back into ciphertext on screen. Re-enter the code to unlock. |
| **One-time chats** | Custom link name you choose (`/once/moon-tiger-42`). Messages travel over realtime broadcast only — **never stored**. When either person leaves, the room deletes itself: lost in space. |
| **SEO** | Full metadata, OpenGraph, JSON-LD SoftwareApplication schema, sitemap.xml, robots.txt. |
| **Installable (PWA)** | PWA manifest + icons → installable from the browser on any device; Capacitor-ready for a Play Store wrapper. |

## Stack
Next.js 14 (App Router) · Supabase (Auth + Postgres + Realtime) · Tailwind CSS · Web Crypto API

## Quick start
```bash
# 1. Supabase (free) — create project at supabase.com
#    SQL Editor → paste & run database/schema.sql (creates tables, the
#    username column + availability RPC, and the auto-friend trigger)
#    Authentication → Providers → Email → turn ON "Confirm email"
#    Authentication → URL Configuration → set Site URL to your domain

# 2. Frontend
cd frontend
cp ../.env.example .env.local     # fill in your Supabase URL + anon key
npm install
npm run dev                        # → http://localhost:3000
```

## Deployment
See [DEPLOY.md](DEPLOY.md) for the full guide. In short: the app is deployed via
Docker behind a Caddy reverse proxy on a VPS — `./deploy.sh` builds, ships, and
restarts the container in one command. It also self-trims Docker build cache so
it never grows unbounded.

## Security model (honest version)
- The chat code never leaves the browser; losing it means those messages stay locked forever (by design).
- One-time chats are broadcast-only: if both people are offline, the messages simply don't exist anywhere.
- The 60-second lock is a client-side privacy shield (shoulder-surfing, borrowed phones). The underlying storage is *always* ciphertext regardless.
