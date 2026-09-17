# 🚀 Mivloc — Deployment Guide

## 1. Database + Auth — self-hosted Supabase on the VPS (default)
Mivloc runs the open-source Supabase stack on the same VPS as the site:
Postgres 17, Auth (GoTrue), REST (PostgREST) and Realtime behind a Kong
gateway. Caddy exposes it at **`https://mivloc.online/api/*`**. Everything
lives in [supabase/](supabase/) — no supabase.com account, no free-tier
pausing.

**First-time bring-up (already done for mivloc.online):**
```bash
# on the VPS, after ./deploy.sh has synced the repo once
cd /root/mivloc/supabase
./setup.sh                 # generates .env with secrets; prints the anon key
docker compose up -d       # 5 containers: db, auth, rest, realtime, kong
./apply-schema.sh          # applies ../database/schema.sql (idempotent)
```
Then add a `handle_path /api/*` → `supabase-kong:8000` block to the Caddyfile
(see [supabase/README.md](supabase/README.md)), put the printed URL + anon
key in `frontend/.env.local`, and run `./deploy.sh`.

**Email verification** needs SMTP. Without a mailer GoTrue *silently* creates
accounts that can never be verified, so signups stay **disabled**
(`DISABLE_SIGNUP=true`) until SMTP is configured. To enable: in
`/root/mivloc/supabase/.env` fill in `SMTP_HOST/PORT/USER/PASS` (Resend, Brevo,
SES, Gmail app password…), set `DISABLE_SIGNUP=false`, then
`cd /root/mivloc/supabase && docker compose up -d auth`. Emergency bypass
(accounts activate with no email at all): `ENABLE_EMAIL_AUTOCONFIRM=true`.

**Day-to-day:**
- `./deploy.sh` keeps the stack up (`docker compose up -d` is a no-op unless
  the compose file changed) and installs the nightly backup cron.
- Schema change: edit `database/schema.sql`, then
  `ssh root@VPS /root/mivloc/supabase/apply-schema.sh`.
- Backups: `/root/mivloc-backups/mivloc-YYYY-MM-DD.sql.gz` nightly at 03:15
  (`/etc/cron.d/mivloc-backup`), 14 kept. They're on the same VPS — copy them
  off-box periodically.
- This VPS's disk is slow (~25 ms per I/O). Expect `./deploy.sh` builds to take
  15–25 min, and never interrupt a `docker compose up/down` mid-way — a killed
  first-boot once left Postgres half-migrated and needed `down -v` to recover.
- SQL access: `docker exec -it supabase-db psql -U supabase_admin -d postgres`
- Logs: `cd /root/mivloc/supabase && docker compose logs -f auth` (or rest/realtime/kong/db)

<details>
<summary><b>Alternative: hosted supabase.com project</b> (the original setup — click to expand)</summary>

1. Create a project at supabase.com (or reuse your dev project — a separate
   production project is cleaner).
2. **SQL Editor** → run `database/schema.sql` (idempotent for tables/grants;
   on a re-run you may see "policy already exists" errors — those are harmless).
3. **Authentication → Providers → Email** → enable **Confirm email** (this enforces email verification).
   Also enable **"Prevent duplicate sign-ups with the same email"** (Auth settings) so the
   auth layer rejects a repeat registration. The DB in `schema.sql` already enforces
   one-account-per-email as a hard backstop, but turning this on gives a cleaner error.
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


</details>

## 2. Website — Option A: Vercel (easiest, free)
```bash
npm i -g vercel
cd frontend
vercel --prod
```
Environment variables to set in the Vercel dashboard (Settings → Environment Variables):
```
NEXT_PUBLIC_SUPABASE_URL=https://mivloc.online/api      # or a hosted project URL
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
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://mivloc.online/api \
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

## Troubleshooting
**Nothing works — one-time chat says "Can't reach Mivloc's server", login/signup fail.**
Self-hosted: `ssh root@VPS 'cd /root/mivloc/supabase && docker compose ps'` —
every service should be `healthy`; `docker compose logs --tail 50 <service>`
for the one that isn't, then `docker compose up -d`. Also
`curl -s https://mivloc.online/api/auth/v1/health` should return JSON.

**(Hosted supabase.com only)** browser console shows `ERR_NAME_NOT_RESOLVED xxxx.supabase.co`:
the Supabase project has been **paused**. Free-tier projects pause after
~7 days without activity, and a paused project's hostname is removed from DNS,
so every request fails before it reaches a server (quick check:
`dig xxxx.supabase.co` → `NXDOMAIN`). Fix: Supabase dashboard → the project →
**Restore project** → wait a few minutes. No redeploy needed — the URL and keys
stay the same. If the project was deleted instead (paused projects are
eventually purged), create a new one, repeat section 1 above, put the new
URL + anon key in `frontend/.env.local`, and run `./deploy.sh`.
To stop it recurring: upgrade the project, or keep it active with a scheduled
ping (e.g. a cron/GitHub Action that hits `/rest/v1/onetime_rooms?select=slug&limit=1`
with the anon key every few days).

## Local development
```bash
cd frontend && cp ../.env.example .env.local && npm i && npm run dev
```
