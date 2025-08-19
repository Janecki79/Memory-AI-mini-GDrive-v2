@echo off
setlocal enabledelayedexpansion

set "BASE=%1"
if "%BASE%"=="" set "BASE=https://memory-ai-mini-gdrive-v2.onrender.com"
set "API_KEY=%2"

set "AUTH="
if not "%API_KEY%"=="" set "AUTH=-H \"Authorization: Bearer %API_KEY%\""

echo Testing API at %BASE%

echo 1. GET /status
for /f "delims=" %%A in ('curl -s -o NUL -w "%%{http_code}" %BASE%/status') do set "CODE=%%A"
echo /status -> %CODE%
if not "%CODE%"=="200" (
  echo Expected 200
  exit /b 1
)

echo 2. POST /memory/notes and verify
set "NOTE=Test note %RANDOM%"
for /f "delims=" %%A in ('curl -s -o NUL -w "%%{http_code}" %AUTH% -d "text=!NOTE!" %BASE%/memory/notes') do set "CODE=%%A"
echo POST /memory/notes -> %CODE%
if not "%CODE%"=="200" (
  echo Failed to post note
  exit /b 1
)
curl -s %AUTH% %BASE%/memory/notes > tmp_notes.txt
findstr /C:"!NOTE!" tmp_notes.txt >nul
if errorlevel 1 (
  echo Note not found
  del tmp_notes.txt
  exit /b 1
)
del tmp_notes.txt
echo Verified note appended.

echo 3. POST /memory/upload
echo sample upload>tmp_upload.txt
for /f "delims=" %%A in ('curl -s -o NUL -w "%%{http_code}" %AUTH% -F "file=@tmp_upload.txt" %BASE%/memory/upload') do set "CODE=%%A"
del tmp_upload.txt
echo POST /memory/upload -> %CODE%
if not "%CODE%"=="200" (
  echo Memory upload failed
  exit /b 1
)

echo 4. POST /upload-gdrive
echo sample upload>tmp_gd.txt
for /f "delims=" %%A in ('curl -s -o NUL -w "%%{http_code}" %AUTH% -F "file=@tmp_gd.txt" %BASE%/upload-gdrive') do set "CODE=%%A"
del tmp_gd.txt
echo POST /upload-gdrive -> %CODE%
if "%CODE%"=="200" (
  echo GDrive upload succeeded
) else if "%CODE%"=="501" (
  echo GDrive disabled
) else (
  echo Unexpected status: %CODE%
  exit /b 1
)

echo All tests completed.
exit /b 0
