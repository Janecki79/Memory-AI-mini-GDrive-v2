@echo off
setlocal

if "%BASE_URL%"=="" (
  set "BASE_URL=http://localhost:3000"
)

if not "%API_KEY%"=="" (
  set "HEADER=-H x-api-key:%API_KEY%"
)

echo GET /status
curl -s %HEADER% %BASE_URL%/status
echo.

echo POST /memory/test
curl -s %HEADER% -H "Content-Type: application/json" -d "{\"text\":\"hello from script\"}" %BASE_URL%/memory/test
echo.

echo GET /memory/test
curl -s %HEADER% %BASE_URL%/memory/test
echo.

echo POST /memory/upload
curl -s %HEADER% -F "file=@README.md" %BASE_URL%/memory/upload
echo.

endlocal
