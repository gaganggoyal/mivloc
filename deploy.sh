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
  ./ "$SERVER:$REMOTE_DIR/"
scp -q frontend/.env.local "$SERVER:$REMOTE_DIR/frontend/.env.build"

# 3. Build image + swap container on the server
echo "▸ Building and restarting on server…"
ssh "$SERVER" "
  set -euo pipefail
  cd $REMOTE_DIR/frontend
  set -a; . ./.env.build; set +a
  docker build -q \
    --build-arg NEXT_PUBLIC_SUPABASE_URL=\"\$NEXT_PUBLIC_SUPABASE_URL\" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=\"\$NEXT_PUBLIC_SUPABASE_ANON_KEY\" \
    --build-arg NEXT_PUBLIC_SITE_URL=\"$SITE_URL\" \
    -t mivloc .
  docker rm -f mivloc >/dev/null 2>&1 || true
  docker run -d --restart unless-stopped --name mivloc --network $NETWORK mivloc >/dev/null
  rm -f ./.env.build
  docker image prune -f >/dev/null
  # Trim build cache but keep ~2GB so future builds stay fast
  docker builder prune -f --keep-storage 2GB >/dev/null
"

# 4. Smoke check
echo "▸ Waiting for the site…"
sleep 5
code=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 10 "$SITE_URL")
if [ "$code" = "200" ]; then
  echo "✅ Deployed — $SITE_URL is live (HTTP $code)"
else
  echo "⚠️  $SITE_URL returned HTTP $code — check: ssh $SERVER 'docker logs mivloc --tail 50'"
  exit 1
fi
