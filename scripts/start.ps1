# Start Resume Genie quietly: API (8080) + website (5173), hidden windows, no browser tab.
# The repo folder is this script's parent, so the same file works from any clone.
# Logs and pid files go to <repo>\logs (gitignored).
# A port that is already taken is left alone. This script never stops another program.
$ErrorActionPreference = 'Stop'
$app = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
$log = Join-Path $app 'logs'
New-Item -ItemType Directory -Path $log -Force | Out-Null
$checked = $false
foreach ($p in @(@{ n = 'api'; port = 8080; cmd = 'dev:api' }, @{ n = 'web'; port = 5173; cmd = 'dev:web' })) {
  if (Get-NetTCPConnection -LocalPort $p.port -State Listen -ErrorAction SilentlyContinue) {
    Write-Output "$($p.n): already running on port $($p.port), skipped (left alone)"
    continue
  }
  if (-not $checked) {
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { throw 'pnpm is not on PATH. Install Node.js, then run: corepack enable' }
    if (-not (Test-Path (Join-Path $app 'node_modules'))) { throw "Dependencies missing. Run 'pnpm install' in $app first." }
    if (-not (Test-Path (Join-Path $app '.env'))) { throw "No .env file. Copy .env.example to .env in $app and fill it in." }
    $checked = $true
  }
  $env:PORT = "$($p.port)"
  # The clone path is on the command line so stop.ps1 can tell this process from any other clone or service.
  $arg = "/c set `"RESUME_GENIE_ROOT=$app`"&& pnpm $($p.cmd) > `"$log\$($p.n).log`" 2>&1"
  $proc = Start-Process cmd.exe -ArgumentList $arg -WorkingDirectory $app -WindowStyle Hidden -PassThru
  Set-Content -Path (Join-Path $log "$($p.n).pid") -Value $proc.Id -Encoding ascii
  Write-Output "$($p.n): starting on port $($p.port) (log: logs\$($p.n).log, pid: $($proc.Id))"
  Start-Sleep -Seconds 2
}
Write-Output 'Open http://localhost:5173 when you want to use it.'
