# Stop Resume Genie: ends the API (port 8080) and website (port 5173).
# Only stops a process if it (or the cmd/pnpm chain that started it) belongs to Resume Genie,
# i.e. points into this repo or runs a @workspace/api-server or @workspace/resume-ai script. -Force skips that check.
param([switch]$Force)
$app = Split-Path -Parent $PSScriptRoot
$marks = @("*$app*", "*$($app -replace '\\','/')*", '*@workspace/api-server*', '*@workspace/resume-ai*')
foreach ($port in 8080, 5173) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if (-not $conns) { Write-Output "port ${port}: not running"; continue }
  foreach ($procId in ($conns.OwningProcess | Sort-Object -Unique)) {
    # Walk up the cmd/node chain to the outermost launcher window, checking ownership on the way.
    $cur = Get-CimInstance Win32_Process -Filter "ProcessId=$procId"; $root = $procId; $mine = $false
    while ($cur) {
      foreach ($m in $marks) { if ($cur.CommandLine -like $m) { $mine = $true } }
      $root = $cur.ProcessId
      $cur = Get-CimInstance Win32_Process -Filter "ProcessId=$($cur.ParentProcessId)" -ErrorAction SilentlyContinue
      if (-not $cur -or $cur.Name -notin 'cmd.exe','node.exe') { break }
    }
    if (-not $mine -and -not $Force) { Write-Output "port ${port}: PID $procId is not Resume Genie, left alone (use -Force)"; continue }
    taskkill /PID $root /T /F | Out-Null
    Write-Output "port ${port}: stopped (PID $root and children)"
  }
}
