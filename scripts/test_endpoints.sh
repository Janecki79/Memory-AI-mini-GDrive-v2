#!/usr/bin/env bash
# Basic smoke tests for the API endpoints.

BASE_URL=${BASE_URL:-http://localhost:3000}
AUTH_HEADER=""
if [ -n "$API_KEY" ]; then
  AUTH_HEADER="-H x-api-key:$API_KEY"
fi

echo "GET /status"
curl -s $AUTH_HEADER "$BASE_URL/status"
echo

echo "POST /memory/test"
curl -s $AUTH_HEADER -H "Content-Type: application/json" \
  -d '{"text":"hello from script"}' "$BASE_URL/memory/test"
echo

echo "GET /memory/test"
curl -s $AUTH_HEADER "$BASE_URL/memory/test"
echo

echo "POST /memory/upload"
curl -s $AUTH_HEADER -F "file=@README.md" "$BASE_URL/memory/upload"
echo
