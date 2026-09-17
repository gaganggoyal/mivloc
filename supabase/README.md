# Self-hosted Supabase for Mivloc

Trimmed from the official [supabase/docker](https://github.com/supabase/supabase/tree/master/docker)
stack: Postgres 17 · Auth (GoTrue) · REST (PostgREST) · Realtime · Kong.
The Next.js app talks to it exactly like a hosted project — only the URL and
anon key differ. Full ops notes: [../DEPLOY.md](../DEPLOY.md) §1.

| File | Purpose |
|---|---|
| `docker-compose.yml` | the 5 services; Kong also joins Caddy's shared network |
| `kong.yml` / `kong-entrypoint.sh` | gateway routes: apikey check → auth / rest / realtime |
| `db/*.sql` | Postgres init (role passwords, JWT expiry, `_realtime` schema) |
| `setup.sh` | one-time: generate `.env` (DB password, JWT secret, anon + service keys) |
| `apply-schema.sh` | apply `../database/schema.sql` — idempotent |
| `backup.sh` | nightly `pg_dump` → `/root/mivloc-backups/` (`/etc/cron.d/mivloc-backup`, written by `deploy.sh`) |
| `.env` | **server-only secrets** (git-ignored, `chmod 600`) — never copy into the repo |

## Caddy
Caddy (already running for the other sites on the VPS) fronts Kong. The
`mivloc.online` block in `/root/cricketverse_deploy/deployment/vps/Caddyfile`:
```
mivloc.online {
	encode gzip
	# Self-hosted Supabase API (auth / rest / realtime) via Kong
	handle_path /api/* {
		reverse_proxy supabase-kong:8000
	}
	handle {
		reverse_proxy mivloc:3000
	}
}
```
Apply with `docker exec cricketverse_deploy-caddy-1 caddy reload --config /etc/caddy/Caddyfile`.

## Health check
```bash
curl -s https://mivloc.online/api/auth/v1/health          # {"version":…,"name":"GoTrue"…}
curl -s -H "apikey: $ANON" https://mivloc.online/api/rest/v1/onetime_rooms?select=slug
```
