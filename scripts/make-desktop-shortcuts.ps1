# Optional: makes Start/Stop Resume Genie shortcuts (.lnk) for THIS clone on your Desktop.
$app = Split-Path -Parent $PSScriptRoot
$desk = [Environment]::GetFolderPath('Desktop'); $sh = New-Object -ComObject WScript.Shell
foreach ($a in 'Start','Stop') {
  $l = $sh.CreateShortcut((Join-Path $desk "$a Resume Genie.lnk"))
  $l.TargetPath = 'wscript.exe'; $l.Arguments = "`"$app\$a Resume Genie.vbs`""; $l.WorkingDirectory = $app
  $l.Save(); Write-Output "Created $desk\$a Resume Genie.lnk"
}
