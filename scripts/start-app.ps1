param(
    [string]$FrontendUrl = "http://localhost:3000",
    [string]$AppUrl = "http://localhost:3000"
)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot

Write-Host "Starting frontend on $FrontendUrl..."
Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev") -WorkingDirectory $repoRoot | Out-Null

# Wait for React dev server to be ready on port 3000 before launching the .NET desktop application
$waitTimeout = 30  # seconds
$timer = 0
Write-Host "Waiting for React dev server to listen on port 3000..."
while (-not (Get-NetTCPConnection -LocalPort 3000 -DestinationPort 3000 -ErrorAction SilentlyContinue)) {
    Start-Sleep -Seconds 1
    $timer++
    if ($timer -ge $waitTimeout) {
        Write-Host "React dev server did not start within $waitTimeout seconds. Proceeding anyway."
        break
    }
}


Write-Host "Launching WinForms host with APP_URL=$AppUrl..."
$previousAppUrl = $env:APP_URL
$env:APP_URL = $AppUrl

try {
    Push-Location $repoRoot
    dotnet run
}
finally {
    if ([string]::IsNullOrWhiteSpace($previousAppUrl)) {
        Remove-Item Env:APP_URL -ErrorAction SilentlyContinue
    }
    else {
        $env:APP_URL = $previousAppUrl
    }

    Pop-Location
}