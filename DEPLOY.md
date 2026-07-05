# 🚀 SafeChat — Deployment Guide

## 1. Database — Supabase (free tier)
1. Create a project at supabase.com
2. **SQL Editor** → run `database/schema.sql`
3. **Authentication → Providers → Email** → enable **Confirm email** (this enforces email verification)
4. **Authentication → URL Configuration**:
   - Site URL: `https://safechat.website`
   - Redirect URLs: `https://safechat.website/auth/callback`
5. Copy **Project URL** and **anon key** from Settings → API

## 2. Website — Vercel (free)
```bash
npm i -g vercel
cd frontend
vercel --prod
```
Environment variables to set in the Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://safechat.website
```
Point your `safechat.website` domain at Vercel (Settings → Domains).

## 3. Android app — Play Store (Capacitor)
SafeChat needs its server (auth middleware + email-verification callback), so it
cannot be statically exported. The Android app is a native wrapper that loads
the live site — `capacitor.config.json` already points `server.url` at
`https://safechat.website` and ships an offline fallback page from
`frontend/capacitor-shell/`.

**Deploy the website (step 2) first**, then:
```bash
cd frontend
npm i -D @capacitor/cli @capacitor/core @capacitor/android
npx cap add android
npx cap sync
npx cap open android      # opens Android Studio
```
In Android Studio: **Build → Generate Signed Bundle (AAB)** → upload to the
Play Console. `capacitor.config.json` already sets app id `website.safechat.app`,
splash and status-bar colors. App icons live in `frontend/public/icons/`
(regenerate Android launcher icons from `icon-512.png` via Android Studio's
Image Asset tool).

> Alternative: since SafeChat is a full PWA (manifest + icons included), you
> can instead publish a Trusted Web Activity with Bubblewrap:
> `npx @bubblewrap/cli init --manifest https://safechat.website/manifest.json`

## 4. Housekeeping (optional but recommended)
- Schedule the stale-room purge: Supabase → Database → Cron (pg_cron):
  `select cron.schedule('purge-rooms','0 * * * *','select purge_stale_rooms()');`
- Icons are pre-generated at `frontend/public/icons/` — replace with your own
  branding whenever you like (192, 512 and apple-touch sizes).

## Local development
```bash
cd frontend && cp ../.env.example .env.local && npm i && npm run dev
```
