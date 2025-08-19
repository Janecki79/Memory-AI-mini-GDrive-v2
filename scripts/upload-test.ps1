# Usage:
#   pwsh ./scripts/upload-test.ps1 -Base https://<your-app>.onrender.com -File "C:\path\to\file.txt"
param([string]$Base = "https://memory-ai-mini-gdrive-v2.onrender.com",
      [string]$File)
if (-not $File) {
  $desktop = [Environment]::GetFolderPath('Desktop')
  $File = Join-Path $desktop 'test.txt'
  Set-Content -Path $File -Value "Test file for upload"
}
Write-Host "BASE =" $Base
if (-not (Test-Path $File)) { Write-Error "File not found: $File"; exit 1 }
$resp = Invoke-RestMethod -Method POST -Uri "$Base/memory/upload" -Form @{ file = Get-Item $File }
$resp | ConvertTo-Json -Compress
