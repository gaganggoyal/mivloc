#!/usr/bin/env bash
# Nightly logical backup (auth users + app tables). Scheduled via
# /etc/cron.d/mivloc-backup (written by deploy.sh). Restore: gunzip -c FILE | docker exec -i supabase-db psql -U supabase_admin -d postgres
# NOTE: backups sit on the same VPS — copy the folder off-box for real safety.
set -euo pipefail
DIR=/root/mivloc-backups
KEEP_DAYS=14
mkdir -p "$DIR"
out="$DIR/mivloc-$(date +%F).sql.gz"
docker exec supabase-db pg_dump -U supabase_admin -d postgres --clean --if-exists -n public -n auth | gzip > "$out"
find "$DIR" -name 'mivloc-*.sql.gz' -mtime +"$KEEP_DAYS" -delete
echo "$(date -Is) backup ok: $out ($(du -h "$out" | cut -f1))"
