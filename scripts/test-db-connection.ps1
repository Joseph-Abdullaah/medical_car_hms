# Test MySQL connection for MediCare HMS
# ---------------------------------------------------
# This script verifies that the C# repository can open a MySQL connection
# using the MYSQL_CONN environment variable (or the fallback).
# Usage:   .\test-db-connection.ps1
# ---------------------------------------------------

# Ensure MySql.Data assembly is available
Add-Type -AssemblyName "MySql.Data"

# Build connection string – prefers env var, falls back to default
$cs = $env:MYSQL_CONN
if ([string]::IsNullOrWhiteSpace($cs)) {
    $cs = "Server=localhost;Database=medicare_hms;Uid=root;Pwd=12345678;"
    Write-Host "MYSQL_CONN not set – using fallback connection string."
}
else {
    Write-Host "Using MYSQL_CONN from environment."
}

try {
    $conn = New-Object MySql.Data.MySqlClient.MySqlConnection $cs
    $conn.Open()
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT COUNT(*) AS userCount FROM users;"
    $count = $cmd.ExecuteScalar()
    Write-Host "✅ Connection successful. Users table contains $count rows."
}
catch {
    Write-Error "❌ Failed to connect or query MySQL: $_"
}
finally {
    if ($conn -and $conn.State -eq 'Open') { $conn.Close() }
}
