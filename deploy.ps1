param (
  [string]$WebServerIp,
  [string]$WebServerUser,
  [SecureString]$WebServerPassword,
  [string]$Source,
  [string]$Dest
)

$securePassword = ConvertTo-SecureString $WebServerPassword -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential ($WebServerUser, $securePassword)
$session = New-PSSession -ComputerName $WebServerIp -Credential $cred

Invoke-Command -Session $session -ScriptBlock {
  param($dest)
  if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
  New-Item -ItemType Directory -Path $dest | Out-Null
} -ArgumentList $Dest

Copy-Item -Path $Source -Destination $Dest -Recurse -ToSession $session
Remove-PSSession $session