# Start Resume Genie quietly: API (8080) + website (5173), hidden windows, no browser tab.
# Paths are relative to this repo. Logs go to <repo>\logs (gitignored).
# Anything already listening on a port is left alone (skipped).
$ErrorActionPreference = 'Stop'
$app = Split-Path -Parent $PSScriptRoot
$log = Join-Path $app 'logs'
New-Item -ItemType Directory $log -Force | Out-Null
foreach ($p in @(@{n='api'; port=8080; cmd='dev:api'}, @{n='web'; port=5173; cmd='dev:web'})) {
  if (Get-NetTCPConnection -LocalPort $p.port -State Listen -ErrorAction SilentlyContinue) {
    Write-Output "$($p.n): already running on port $($p.port), skipped"; continue
  }
  if (-not $checked) {
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { throw 'pnpm is not on PATH. Install Node.js, then run: corepack enable' }
    if (-not (Test-Path (Join-Path $app 'node_modules'))) { throw "Dependencies missing. Run 'pnpm install' in $app first." }
    if (-not (Test-Path (Join-Path $app '.env'))) { throw "No .env file. Copy .env.example to .env in $app and fill it in." }
    $checked = $true
  }
  $env:PORT = $p.port
  Start-Process cmd.exe -ArgumentList "/c pnpm $($p.cmd) > `"$log\$($p.n).log`" 2>&1" -WorkingDirectory $app -WindowStyle Hidden
  Write-Output "$($p.n): starting on port $($p.port) (log: logs\$($p.n).log)"
  Start-Sleep 2
}
Write-Output 'Open http://localhost:5173 when you want to use it.'

