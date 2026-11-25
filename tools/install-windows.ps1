#Requires -Version 5.1
$ErrorActionPreference='Stop'
$repo=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$package=Get-AppxPackage -Name OpenAI.Codex | Select-Object -First 1
if(-not $package -or $package.SignatureKind -ne 'Store') {throw 'Install the official Microsoft Store Codex application first.'}
$node=Join-Path $package.InstallLocation 'app\resources\cua_node\bin\node.exe'
if(-not(Test-Path -LiteralPath $node)) {throw 'This Codex version does not include the required Node runtime.'}
& (Join-Path $PSScriptRoot 'build-startup-gate.ps1')
$desktop=[Environment]::GetFolderPath('Desktop')
$shell=New-Object -ComObject WScript.Shell
$entry=@('Codex Perlica','launch-hidden.vbs','launch.ico')
$shortcutPath=Join-Path $desktop ($entry[0]+'.lnk')
# Repoint an existing project shortcut to this extracted copy.
$shortcut=$shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath=Join-Path $env:WINDIR 'System32\wscript.exe'
$shortcut.Arguments='"'+(Join-Path $PSScriptRoot $entry[1])+'"'
$shortcut.WorkingDirectory=$repo
$shortcut.IconLocation=(Join-Path $repo ('assets\icons\'+$entry[2]))+',0'
$shortcut.Save()

# A separate one-click entry for the in-app wallpaper settings.
$settingsPath=Join-Path $desktop 'Codex Perlica Settings.lnk'
$settingsShortcut=$shell.CreateShortcut($settingsPath)
$settingsShortcut.TargetPath=Join-Path $env:WINDIR 'System32\wscript.exe'
$settingsShortcut.Arguments='"'+(Join-Path $PSScriptRoot 'settings-hidden.vbs')+'"'
$settingsShortcut.WorkingDirectory=$repo
$settingsShortcut.IconLocation=(Join-Path $repo 'assets\icons\settings.ico')+',0'
$settingsShortcut.Save()
Write-Output 'Installed. Fully exit Codex, then open Codex Perlica. Use Codex Perlica Settings after Codex is running.'
