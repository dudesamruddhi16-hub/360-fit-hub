# Complete Setup Script for Node.js PATH Fix
# Run this script to fix Node.js PATH issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Node.js PATH Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js exists
$nodePath = "C:\Program Files\nodejs"
$nodeExe = "$nodePath\node.exe"

if (-not (Test-Path $nodeExe)) {
    Write-Host "❌ Node.js not found at: $nodePath" -ForegroundColor Red
    Write-Host "Please check your Node.js installation." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js found at: $nodePath" -ForegroundColor Green
Write-Host ""

# Fix Execution Policy
Write-Host "Step 1: Fixing PowerShell Execution Policy..." -ForegroundColor Yellow
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force -ErrorAction Stop
    Write-Host "✅ Execution policy updated!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not update execution policy. You may need to run as Administrator." -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Add to current session PATH
Write-Host "Step 2: Adding Node.js to current session PATH..." -ForegroundColor Yellow
if ($env:Path -notlike "*$nodePath*") {
    $env:Path += ";$nodePath"
    Write-Host "✅ Added to current session PATH!" -ForegroundColor Green
} else {
    Write-Host "✅ Already in current session PATH!" -ForegroundColor Green
}
Write-Host ""

# Add to System PATH permanently
Write-Host "Step 3: Adding Node.js to System PATH permanently..." -ForegroundColor Yellow
try {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    if ($currentPath -notlike "*$nodePath*") {
        $newPath = $currentPath + ";$nodePath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        Write-Host "✅ Added to System PATH permanently!" -ForegroundColor Green
        Write-Host "   You may need to restart your terminal for changes to take effect." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Already in System PATH!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not update System PATH. You may need to run as Administrator." -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   You can manually add it using the GUI method (see QUICK_FIX.md)" -ForegroundColor Yellow
}
Write-Host ""

# Verify installation
Write-Host "Step 4: Verifying installation..." -ForegroundColor Yellow
Write-Host ""

try {
    $nodeVersion = & "$nodePath\node.exe" --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not get Node.js version" -ForegroundColor Red
}

try {
    $npmVersion = & "$nodePath\npm.cmd" --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not get npm version" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Close and reopen your terminal" -ForegroundColor White
Write-Host "2. Navigate to your project: cd E:\Gym" -ForegroundColor White
Write-Host "3. Run: npm install" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host ""



