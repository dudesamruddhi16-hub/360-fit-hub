# PowerShell script to add Node.js to PATH
# Run this script as Administrator

Write-Host "Checking Node.js installation..." -ForegroundColor Yellow

$nodePath = "C:\Program Files\nodejs"
$nodeExe = "$nodePath\node.exe"

if (Test-Path $nodeExe) {
    Write-Host "Node.js found at: $nodePath" -ForegroundColor Green
    
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    if ($currentPath -notlike "*$nodePath*") {
        Write-Host "Adding Node.js to System PATH..." -ForegroundColor Yellow
        
        # Add to System PATH
        $newPath = $currentPath + ";$nodePath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        
        # Also add to current session
        $env:Path += ";$nodePath"
        
        Write-Host "Node.js has been added to PATH!" -ForegroundColor Green
        Write-Host "Please restart your terminal for changes to take effect." -ForegroundColor Yellow
    } else {
        Write-Host "Node.js is already in PATH!" -ForegroundColor Green
    }
} else {
    Write-Host "Node.js not found at expected location!" -ForegroundColor Red
    Write-Host "Please check your Node.js installation." -ForegroundColor Red
}

Write-Host "`nVerifying installation..." -ForegroundColor Yellow
$env:Path += ";$nodePath"
& "$nodePath\node.exe" --version
& "$nodePath\npm.cmd" --version



