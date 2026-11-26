# Stop Resume Genie for THIS clone only (API port 8080 and website port 5173).
# A process is ours only when its command line or executable path contains this
# clone's folder as a whole path. Another clone, and any unrelated service on
# those ports, is left running. -Force does not override that check.
# Keep the path rule in sync with scripts/src/launcher-ownership.ts.
param([switch]$Force)
$ErrorActionPreference = 'Stop'
$app = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
$log = Join-Path $app 'logs'

function Test-PathInText([string]$Hay, [string]$Needle) {
  if (-not $Needle -or $Needle.Length -le 3) { return $false }
  $from = 0
  while ($from -le $Hay.Length) {
    $at = $Hay.IndexOf($Needle, $from, [System.StringComparison]::OrdinalIgnoreCase)
    if ($at -lt 0) { return $false }
    $nextAt = $at + $Needle.Length
    if ($nextAt -ge $Hay.Length) { return $true }
    $next = $Hay[$nextAt]
    if ($next -in @('\', '/', '"', "'", ' ', "`t", "`r", "`n", '&')) { return $true }
    $from = $at + 1
  }
  return $false
}

function Test-OwnsClone($Proc) {
  if (-not $Proc) { return $false }
  $root = $app.TrimEnd('\', '/')
  $needles = @($root, ($root -replace '\\', '/'), ($root -replace '/', '\'))
  $hay = "$($Proc.CommandLine) `n $($Proc.ExecutablePath)"
  foreach ($needle in $needles) {
    if (Test-PathInText $hay $needle) { return $true }
  }
  return $false
}

function Stop-OwnedProcess([int]$ProcId, [string]$Label) {
  $cur = Get-CimInstance Win32_Process -Filter "ProcessId=$ProcId" -ErrorAction SilentlyContinue
  if (-not $cur) {
    Write-Output "$Label`: PID $ProcId is not running"
    return
  }
  $killId = $null
  while ($cur) {
    if (Test-OwnsClone $cur) { $killId = [int]$cur.ProcessId }
    $parent = Get-CimInstance Win32_Process -Filter "ProcessId=$($cur.ParentProcessId)" -ErrorAction SilentlyContinue
    if (-not $parent -or $parent.Name -notin 'cmd.exe', 'node.exe') { break }
    $cur = $parent
  }
  if (-not $killId) {
    Write-Output "$Label`: PID $ProcId is not this Resume Genie clone, left alone"
    return
  }
  taskkill /PID $killId /T /F | Out-Null
  Write-Output "$Label`: stopped (PID $killId and children)"
}

if ($Force) {
  Write-Output '-Force does not stop unrelated programs. Only this clone can be stopped.'
}

foreach ($name in 'api', 'web') {
  $pidFile = Join-Path $log "$name.pid"
  if (-not (Test-Path $pidFile)) { continue }
  $raw = (Get-Content -Path $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  Remove-Item -Path $pidFile -Force -ErrorAction SilentlyContinue
  $ownedId = 0
  if ([int]::TryParse("$raw", [ref]$ownedId)) {
    Stop-OwnedProcess $ownedId "$name pid"
  }
}

foreach ($port in 8080, 5173) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if (-not $conns) {
    Write-Output "port ${port}: not running"
    continue
  }
  foreach ($procId in ($conns.OwningProcess | Sort-Object -Unique)) {
    Stop-OwnedProcess ([int]$procId) "port ${port}"
  }
}
