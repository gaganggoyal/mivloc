#!/bin/sh
# Kong entrypoint (from supabase/docker/volumes/api/kong-entrypoint.sh, minus
# the opaque sb_* key handling Mivloc doesn't use). Substitutes $VARS into the
# declarative config, then starts Kong.

# Authorization header: keep a user session JWT if present, else the apikey.
export LUA_AUTH_EXPR="\$((headers.authorization ~= nil and headers.authorization:sub(1, 10) ~= 'Bearer sb_' and headers.authorization) or headers.apikey)"
# Realtime websocket: supabase-js passes the apikey as a query param.
export LUA_RT_WS_EXPR="\$(query_params.apikey)"

# awk rather than eval/echo so YAML quoting survives substitution.
awk '{
  result = ""
  rest = $0
  while (match(rest, /\$[A-Za-z_][A-Za-z_0-9]*/)) {
    varname = substr(rest, RSTART + 1, RLENGTH - 1)
    if (varname in ENVIRON) {
      result = result substr(rest, 1, RSTART - 1) ENVIRON[varname]
    } else {
      result = result substr(rest, 1, RSTART + RLENGTH - 1)
    }
    rest = substr(rest, RSTART + RLENGTH)
  }
  print result rest
}' /home/kong/temp.yml > "$KONG_DECLARATIVE_CONFIG"

exec /entrypoint.sh kong docker-start
