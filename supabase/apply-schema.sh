#!/usr/bin/env bash
# (Re)apply ../database/schema.sql to the self-hosted Postgres. Idempotent.
# Waits for GoTrue to have created the auth schema first (the profile trigger
# hangs off auth.users).
set -euo pipefail
cd "$(dirname "$0")"

psql() { docker exec -i supabase-db psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 "$@"; }

for i in $(seq 1 30); do
  if psql -tAc "select 1 from pg_tables where schemaname='auth' and tablename='users'" 2>/dev/null | grep -q 1; then break; fi
  [ "$i" = 30 ] && { echo "✗ auth.users never appeared — is the auth container healthy?"; exit 1; }
  echo "… waiting for auth schema ($i)"; sleep 3
done

psql < ../database/schema.sql
echo "✅ schema applied"
