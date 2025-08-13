#!/usr/bin/env bash
# Simple script to test API endpoints for Memory AI mini server.
# Usage: ./test_endpoints.sh [base_url] [api_key]
# base_url defaults to https://memory-ai-mini-gdrive-v2.onrender.com

set -euo pipefail

BASE_URL="${1:-https://memory-ai-mini-gdrive-v2.onrender.com}"
API_KEY="${2:-}"

AUTH_HEADER=()
if [[ -n "$API_KEY" ]]; then
  AUTH_HEADER=(-H "Authorization: Bearer $API_KEY")
fi

echo "Base URL: $BASE_URL"
if [[ -n "$API_KEY" ]]; then
  echo "Using API key authentication"
fi

echo
echo "GET /status"
curl -sS -w "\nHTTP %{http_code}\n" "$BASE_URL/status"

echo
echo "POST /memory/notes"
curl -sS -w "\nHTTP %{http_code}\n" -X POST "$BASE_URL/memory/notes" \
  -H "Content-Type: application/json" "${AUTH_HEADER[@]}" \
  -d '{"text":"test from script"}'

echo
echo "GET /memory/notes"
curl -sS -w "\nHTTP %{http_code}\n" "$BASE_URL/memory/notes" "${AUTH_HEADER[@]}"

echo
echo "POST /memory/upload"
curl -sS -w "\nHTTP %{http_code}\n" -X POST "$BASE_URL/memory/upload" \
  -F "file=@README.md" "${AUTH_HEADER[@]}"

echo
echo "POST /upload-gdrive (expect 501 if not configured)"
curl -sS -w "\nHTTP %{http_code}\n" -X POST "$BASE_URL/upload-gdrive" \
  -F "file=@README.md" "${AUTH_HEADER[@]}"
