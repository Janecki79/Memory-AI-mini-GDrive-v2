@echo off
REM Simple script to test API endpoints for Memory AI mini server.
REM Usage: test_endpoints.bat [base_url] [api_key]
REM base_url defaults to https://memory-ai-mini-gdrive-v2.onrender.com

set "BASE_URL=%~1"
if "%BASE_URL%"=="" set "BASE_URL=https://memory-ai-mini-gdrive-v2.onrender.com"
set "API_KEY=%~2"
set "AUTH_HEADER="
if not "%API_KEY%"=="" set "AUTH_HEADER=-H \"Authorization: Bearer %API_KEY%\""

echo Base URL: %BASE_URL%
if not "%API_KEY%"=="" echo Using API key authentication

echo.
echo GET /status
curl -s -w "\nHTTP %%{http_code}\n" "%BASE_URL%/status"

echo.
echo POST /memory/notes
curl -s -w "\nHTTP %%{http_code}\n" -X POST "%BASE_URL%/memory/notes" ^
  -H "Content-Type: application/json" %AUTH_HEADER% ^
  -d "{\"text\":\"test from script\"}"

echo.
echo GET /memory/notes
curl -s -w "\nHTTP %%{http_code}\n" "%BASE_URL%/memory/notes" %AUTH_HEADER%

echo.
echo POST /memory/upload
curl -s -w "\nHTTP %%{http_code}\n" -X POST "%BASE_URL%/memory/upload" ^
  -F "file=@README.md" %AUTH_HEADER%

echo.
echo POST /upload-gdrive (expect 501 if not configured)
curl -s -w "\nHTTP %%{http_code}\n" -X POST "%BASE_URL%/upload-gdrive" ^
  -F "file=@README.md" %AUTH_HEADER%
