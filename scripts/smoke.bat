@echo off
setlocal enabledelayedexpansion

set "BASE_URL=%~1"
if "%BASE_URL%"=="" set "BASE_URL=%BASE_URL%"
if "%BASE_URL%"=="" (
  echo BASE_URL required
  exit /b 1
)
set "API_KEY=%~2"
if "%API_KEY%"=="" set "API_KEY=%API_KEY%"

echo HEAD %BASE_URL%/panel
curl -fsSI "%BASE_URL%/panel" >nul || exit /b 1

echo GET %BASE_URL%/status
for /f "delims=" %%A in ('curl -fsS "%BASE_URL%/status"') do set "RESP=%%A"
echo !RESP! | node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))" >nul || exit /b 1

if not "%API_KEY%"=="" (
  echo POST %BASE_URL%/memory/notes
  for /f "delims=" %%A in ('curl -fsS -H "Authorization: Bearer %API_KEY%" -H "Content-Type: application/json" -d {} "%BASE_URL%/memory/notes"') do set "RESP=%%A"
  echo !RESP! | node -e "process.exit(JSON.parse(require('fs').readFileSync(0,'utf8')).ok===true?0:1)" >nul || exit /b 1
)

echo ok
exit /b 0
