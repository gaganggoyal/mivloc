#!/usr/bin/env bash
# One-time: create ./.env with freshly generated secrets. Safe to re-run —
# refuses to overwrite an existing .env (that would orphan the database).
set -euo pipefail
cd "$(dirname "$0")"

if [ -e .env ]; then
  echo "✋ .env already exists — leaving it alone."
  echo "   anon key: $(grep '^ANON_KEY=' .env | cut -d= -f2)"
  exit 0
fi

b64url() { openssl base64 -e -A | tr '+/' '-_' | tr -d '='; }
JWT_SECRET=$(openssl rand -hex 32)
IAT=$(date +%s); EXP=$((IAT + 10*365*24*3600))   # 10-year API keys, like hosted Supabase
jwt() {
  local h p s
  h=$(printf '{"alg":"HS256","typ":"JWT"}' | b64url)
  p=$(printf '{"role":"%s","iss":"supabase","iat":%s,"exp":%s}' "$1" "$IAT" "$EXP" | b64url)
  s=$(printf '%s.%s' "$h" "$p" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | b64url)
  printf '%s.%s.%s' "$h" "$p" "$s"
}

# Start from the example so every documented key is present, then fill secrets.
sed -e '/^#/d' -e '/^$/d' -e 's/ *#.*$//' .env.example > .env
set_kv() { sed -i "s|^$1=.*|$1=$2|" .env; }
set_kv POSTGRES_PASSWORD   "$(openssl rand -hex 24)"
set_kv JWT_SECRET          "$JWT_SECRET"
set_kv ANON_KEY            "$(jwt anon)"
set_kv SERVICE_ROLE_KEY    "$(jwt service_role)"
set_kv SECRET_KEY_BASE     "$(openssl rand -hex 32)"
set_kv REALTIME_DB_ENC_KEY "$(openssl rand -hex 8)"
chmod 600 .env

echo "✅ .env created. Put this in frontend/.env.local:"
echo "   NEXT_PUBLIC_SUPABASE_URL=$(grep '^PUBLIC_API_URL=' .env | cut -d= -f2)"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep '^ANON_KEY=' .env | cut -d= -f2)"
echo "Then fill in the SMTP_* lines in $(pwd)/.env for signup emails."
