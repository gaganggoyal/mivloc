# 🚀 Mivloc — Deployment Guide

## 1. Database — Supabase (free tier)
1. Create a project at supabase.com (or reuse your dev project — a separate
   production project is cleaner).
2. **SQL Editor** → run `database/schema.sql` (idempotent for tables/grants;
   on a re-run you may see "policy already exists" errors — those are harmless).
3. **Authentication → Providers → Email** → enable **Confirm email** (this enforces email verification)
4. **Authentication → URL Configuration**:
   - Site URL: `https://mivloc.online`
   - Redirect URLs: `https://mivloc.online/auth/callback`
5. **Authentication → Emails → Templates → "Confirm signup"** — replace the
   confirmation `<a>` tag with:
   ```html
   <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
   ```
   (makes verification work on any device/browser the link is opened in)
6. Copy **Project URL** and **anon key** from Settings → API

> ⚠️ **Email sending limit:** Supabase's built-in mailer allows only ~2 emails
> per hour — fine for testing, useless in production. Before launch, connect
> real SMTP: **Project Settings → Authentication → SMTP** (Resend, Brevo,
> Amazon SES etc. have free tiers).

## 2. Website — Option A: Vercel (easiest, free)
```bash
npm i -g vercel
cd frontend
vercel --prod
```
Environment variables to set in the Vercel dashboard (Settings → Environment Variables):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://mivloc.online
```
Point your `mivloc.online` domain at Vercel (Settings → Domains), then
**redeploy** so the env vars are baked into the build.

## 2. Website — Option B: your own server (Docker)
The build is configured with `output: 'standalone'` and ships a `Dockerfile`:
```bash
cd frontend
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
  --build-arg NEXT_PUBLIC_SITE_URL=https://mivloc.online \
  -t mivloc .
docker run -d --restart unless-stopped -p 3000:3000 mivloc
```
Put nginx/Caddy in front for HTTPS (Caddy: `caddy reverse-proxy --from mivloc.online --to localhost:3000`).
Without Docker: `npm run build && node .next/standalone/server.js` (copy
`.next/static` → `.next/standalone/.next/static` and `public` → `.next/standalone/public` first).

## 3. Post-deploy smoke test (5 minutes)
1. `https://mivloc.online` loads; **▶ Watch how it works** plays with voice.
2. Sign up with a real email → verification mail arrives → link lands on the dashboard (no error).
3. Invite link shows on the dashboard; open it in a private window → second account connects automatically.
4. Chat: each side sets its own code, messages flow live, conversation locks after 60s.
5. `/once`: create a room in two windows, close one → other side sees "dissolved".
6. Supabase Table Editor → `messages` contains only base64 gibberish.

## 4. Android app — Play Store (Capacitor)
Mivloc needs its server (auth middleware + email-verification callback), so it
cannot be statically exported. The Android app is a native wrapper that loads
the live site — `capacitor.config.json` already points `server.url` at
`https://mivloc.online` and ships an offline fallback page from
`frontend/capacitor-shell/`.

**Deploy the website first**, then:
```bash
cd frontend
npm i -D @capacitor/cli @capacitor/core @capacitor/android
npx cap add android
npx cap sync
npx cap open android      # opens Android Studio
```
In Android Studio: **Build → Generate Signed Bundle (AAB)** → upload to the
Play Console. `capacitor.config.json` already sets app id `com.mivloc.app`,
splash and status-bar colors. App icons live in `frontend/public/icons/`
(regenerate Android launcher icons from `icon-512.png` via Android Studio's
Image Asset tool).

> Alternative: since Mivloc is a full PWA (manifest + icons included), you
> can instead publish a Trusted Web Activity with Bubblewrap:
> `npx @bubblewrap/cli init --manifest https://mivloc.online/manifest.json`

## 5. Housekeeping (optional but recommended)
- Schedule the stale-room purge: Supabase → Database → Cron (pg_cron):
  `select cron.schedule('purge-rooms','0 * * * *','select purge_stale_rooms()');`
- Icons are pre-generated at `frontend/public/icons/` — replace with your own
  branding whenever you like (192, 512 and apple-touch sizes).
- Keep `.env.local` out of git (already in `.gitignore`) — set production keys
  only in the Vercel dashboard / Docker build args.

## Local development
```bash
cd frontend && cp ../.env.example .env.local && npm i && npm run dev
```
