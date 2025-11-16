# Quick Fix for Node.js PATH Issue - Follow These Steps

## ✅ Current Status
- Node.js is installed at: `C:\Program Files\nodejs\`
- Node.js is NOT in your system PATH
- PowerShell execution policy was blocking npm scripts

## 🔧 Step-by-Step Solution

### STEP 1: Fix PowerShell Execution Policy (Already Done)
I've already fixed this for your current session. But for permanent fix:

**Run this in PowerShell (as Administrator or Current User):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### STEP 2: Add Node.js to PATH Permanently

**Option A: Using GUI (Easiest)**

1. Press `Win + X` → Click **"System"**
2. Click **"Advanced system settings"** (right side)
3. Click **"Environment Variables"** button
4. Under **"System variables"** (bottom section), find **"Path"**
5. Select **"Path"** → Click **"Edit"**
6. Click **"New"** button
7. Type: `C:\Program Files\nodejs`
8. Click **"OK"** on all dialogs
9. **Close and reopen** your PowerShell window

**Option B: Using PowerShell (Run as Administrator)**

```powershell
# Add Node.js to System PATH permanently
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*C:\Program Files\nodejs*") {
    $newPath = $currentPath + ";C:\Program Files\nodejs"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
    Write-Host "✅ Node.js added to PATH!" -ForegroundColor Green
} else {
    Write-Host "✅ Node.js is already in PATH!" -ForegroundColor Yellow
}
```

### STEP 3: Restart Your Terminal
- **Close** your current PowerShell window completely
- **Open a new** PowerShell window
- Navigate to your project:
  ```powershell
  cd E:\Gym
  ```

### STEP 4: Verify It Works
```powershell
node --version
npm --version
```

You should see version numbers like:
- `v20.10.0` (or similar for node)
- `10.2.3` (or similar for npm)

### STEP 5: Install Dependencies
```powershell
npm install
```

Wait for it to finish (this may take a few minutes).

### STEP 6: Start Your App
```powershell
npm run dev
```

Your Gym Management System should start! 🎉

---

## 🚀 Quick Commands Reference

```powershell
# For current session only (temporary fix)
$env:Path += ";C:\Program Files\nodejs"

# Verify Node.js
node --version
npm --version

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## ⚠️ If You Still Have Issues

**If `node` or `npm` still not recognized after adding to PATH:**

1. **Restart your computer** (sometimes needed for PATH changes)
2. **Check the exact path exists:**
   ```powershell
   Test-Path "C:\Program Files\nodejs\node.exe"
   ```
   Should return `True`

3. **Try using full path:**
   ```powershell
   & "C:\Program Files\nodejs\node.exe" --version
   & "C:\Program Files\nodejs\npm.cmd" --version
   ```

4. **Check if Node.js is in a different location:**
   ```powershell
   Get-ChildItem -Path "C:\" -Filter "node.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
   ```

---

## 📝 What I Fixed For You

✅ Added Node.js to PATH for current session  
✅ Fixed PowerShell execution policy  
✅ Verified npm works (version 11.6.2 detected)

**Now you need to:**
1. Add Node.js to PATH permanently (Step 2)
2. Restart terminal
3. Run `npm install` and `npm run dev`



