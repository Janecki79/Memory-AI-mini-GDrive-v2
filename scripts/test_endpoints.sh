#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-https://memory-ai-mini-gdrive-v2.onrender.com}"
API_KEY="${2:-}"

AUTH_HEADER=()
if [ -n "$API_KEY" ]; then
  AUTH_HEADER=(-H "Authorization: Bearer $API_KEY")
fi

echo "Testing API at $BASE"

# 1. GET /status
status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/status")
echo "/status -> $status_code"
if [ "$status_code" -ne 200 ]; then
  echo "Expected 200 from /status" >&2
  exit 1
fi

# 2. POST /memory/notes and verify
note="test note $(date +%s)"
status_code=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH_HEADER[@]}" --data-urlencode "text=$note" "$BASE/memory/notes")
echo "POST /memory/notes -> $status_code"
if [ "$status_code" -ne 200 ]; then
  echo "Failed to post note" >&2
  exit 1
fi
content=$(curl -s "${AUTH_HEADER[@]}" "$BASE/memory/notes")
echo "$content" | grep -F "$note" >/dev/null || { echo "Note not found" >&2; exit 1; }
echo "Verified note appended."

# 3. POST /memory/upload
tmpfile=$(mktemp)
echo "sample upload" > "$tmpfile"
status_code=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH_HEADER[@]}" -F "file=@$tmpfile" "$BASE/memory/upload")
rm -f "$tmpfile"
echo "POST /memory/upload -> $status_code"
if [ "$status_code" -ne 200 ]; then
  echo "Memory upload failed" >&2
  exit 1
fi

# 4. POST /upload-gdrive
tmpfile=$(mktemp)
echo "sample upload" > "$tmpfile"
status_code=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH_HEADER[@]}" -F "file=@$tmpfile" "$BASE/upload-gdrive")
rm -f "$tmpfile"
echo "POST /upload-gdrive -> $status_code"
if [ "$status_code" -eq 200 ]; then
  echo "GDrive upload succeeded"
elif [ "$status_code" -eq 501 ]; then
  echo "GDrive disabled"
else
  echo "Unexpected status: $status_code" >&2
  exit 1
fi

echo "All tests completed."
