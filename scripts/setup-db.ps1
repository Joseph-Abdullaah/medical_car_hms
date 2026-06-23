param(
    [string]$Server = "localhost",
    [string]$User = "root",
    [string]$Password = "12345678"
)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
$schemaPath = Join-Path $repoRoot "Database\schema.sql"
$seedPath = Join-Path $repoRoot "Database\seed.sql"

if (-not (Test-Path $schemaPath)) {
    throw "Schema file not found: $schemaPath"
}

if (-not (Test-Path $seedPath)) {
    throw "Seed file not found: $seedPath"
}

$mysql = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysql) {
    throw "mysql command not found. Install the MySQL client tools and ensure mysql is on PATH."
}

$mysqlArgs = @(
    "--host=$Server",
    "--user=$User",
    "--password=$Password"
)

Write-Host "Applying schema from $schemaPath..."
Get-Content $schemaPath -Raw | & $mysql.Path @mysqlArgs
if ($LASTEXITCODE -ne 0) {
    throw "Schema import failed."
}

Write-Host "Applying seed data from $seedPath..."
Get-Content $seedPath -Raw | & $mysql.Path @mysqlArgs
if ($LASTEXITCODE -ne 0) {
    throw "Seed import failed."
}

Write-Host "Database initialization completed successfully."