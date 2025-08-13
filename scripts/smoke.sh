#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${BASE_URL:-}}"
API_KEY="${2:-${API_KEY:-}}"

log(){ echo "[smoke] $*"; }

if [ -z "$BASE_URL" ]; then
  echo "BASE_URL required" >&2
  exit 1
fi

log "HEAD $BASE_URL/panel"
curl -fsSI "$BASE_URL/panel" >/dev/null

log "GET  $BASE_URL/status"
STATUS=$(curl -fsS "$BASE_URL/status")
# ensure response is valid JSON
printf '%s' "$STATUS" | node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))" >/dev/null

if [ -n "$API_KEY" ]; then
  log "POST $BASE_URL/memory/notes"
  RESP=$(curl -fsS -H "Authorization: Bearer $API_KEY" -H "Content-Type: application/json" -d '{}' "$BASE_URL/memory/notes")
  printf '%s' "$RESP" | node -e "process.exit(JSON.parse(require('fs').readFileSync(0,'utf8')).ok===true?0:1)"
fi

log "ok"
