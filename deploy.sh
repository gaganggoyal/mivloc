#!/usr/bin/env bash
# Mivloc one-command deploy → Contabo (mivloc.online)
# Usage: ./deploy.sh
# Reads Supabase keys from frontend/.env.local (never committed to git).
set -euo pipefail

SERVER="root@161.97.97.34"
REMOTE_DIR="/root/mivloc"
SITE_URL="https://mivloc.online"
NETWORK="cricketverse_deploy_default"   # shared Caddy network on the VPS

cd "$(dirname "$0")"

# 1. Local production build must pass before we touch the server
echo "▸ Verifying local build…"
(cd frontend && npx tsc --noEmit)

# 2. Ship the code (no node_modules/.next/.git — server builds its own)
echo "▸ Syncing code to ${SERVER}…"
rsync -az --delete --exclude node_modules --exclude .next --exclude .git \
  --exclude .env.local --exclude .claude --exclude supabase/.env \
  ./ "$SERVER:$REMOTE_DIR/"
scp -q frontend/.env.local "$SERVER:$REMOTE_DIR/frontend/.env.build"

# 3. Self-hosted Supabase (Postgres + Auth + REST + Realtime behind Kong).
#    First run: supabase/setup.sh generates secrets. Afterwards `up -d` is a
#    no-op unless docker-compose.yml changed. Schema changes are explicit:
#    ssh $SERVER $REMOTE_DIR/supabase/apply-schema.sh
echo "▸ Ensuring the Supabase stack is up…"
ssh "$SERVER" "
  set -euo pipefail
  cd $REMOTE_DIR/supabase
  [ -e .env ] || { echo '✗ supabase/.env missing — run supabase/setup.sh on the server first'; exit 1; }
  docker compose up -d --quiet-pull
  # Nightly DB backup — /etc/cron.d like the other projects on this box
  echo '15 3 * * * root $REMOTE_DIR/supabase/backup.sh >> /var/log/mivloc-backup.log 2>&1' > /etc/cron.d/mivloc-backup
  chmod 644 /etc/cron.d/mivloc-backup
"

# 4. Build image + swap container on the server
echo "▸ Building and restarting on server…"
ssh "$SERVER" "
  set -euo pipefail
  cd $REMOTE_DIR/frontend
  set -a; . ./.env.build; set +a
  docker build -q \
    --build-arg NEXT_PUBLIC_SUPABASE_URL=\"\$NEXT_PUBLIC_SUPABASE_URL\" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=\"\$NEXT_PUBLIC_SUPABASE_ANON_KEY\" \
    --build-arg NEXT_PUBLIC_SITE_URL=\"$SITE_URL\" \
    --build-arg NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=\"\${NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:-}\" \
    -t mivloc .
  docker rm -f mivloc >/dev/null 2>&1 || true
  docker run -d --restart unless-stopped --name mivloc --network $NETWORK mivloc >/dev/null
  rm -f ./.env.build
  docker image prune -f >/dev/null
  # Trim build cache but keep ~2GB so future builds stay fast
  docker builder prune -f --keep-storage 2GB >/dev/null
"

# 5. Smoke check
echo "▸ Waiting for the site…"
sleep 5
code=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 10 "$SITE_URL")
ANON=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' frontend/.env.local | cut -d= -f2)
api=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 10 -H "apikey: $ANON" "$SITE_URL/api/auth/v1/health")
if [ "$code" = "200" ] && [ "$api" = "200" ]; then
  echo "✅ Deployed — $SITE_URL is live (site HTTP $code, auth API HTTP $api)"
else
  echo "⚠️  site HTTP $code, auth API HTTP $api — check: ssh $SERVER 'docker logs mivloc --tail 50; docker logs supabase-auth --tail 50'"
  exit 1
fi
