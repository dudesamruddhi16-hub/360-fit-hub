# Fix Node.js PATH Issue - Step by Step Solution

## Problem
Node.js is installed but `node` and `npm` commands are not recognized because Node.js is not in your system PATH.

## Solution: Add Node.js to PATH

### Method 1: Manual Fix (Recommended)

**Step 1: Open Environment Variables**
1. Press `Win + X` (or right-click Start button)
2. Click **"System"**
3. Click **"Advanced system settings"** (on the right side)
4. Click **"Environment Variables"** button (at the bottom)

**Step 2: Edit System PATH**
1. In the **"System variables"** section (bottom half), find **"Path"**
2. Select **"Path"** and click **"Edit"**
3. Click **"New"** button
4. Type: `C:\Program Files\nodejs`
5. Click **"OK"** on all open dialogs

**Step 3: Restart Terminal**
1. **Close** your current PowerShell/Command Prompt completely
2. **Open a new** PowerShell/Command Prompt window
3. Navigate to your project:
   ```powershell
   cd E:\Gym
   ```

**Step 4: Verify It Works**
```powershell
node --version
npm --version
```

You should see version numbers!

**Step 5: Install Dependencies**
```powershell
npm install
```

**Step 6: Start the App**
```powershell
npm run dev
```

---

### Method 2: Using PowerShell (Run as Administrator)

**Step 1: Open PowerShell as Administrator**
1. Press `Win + X`
2. Click **"Windows PowerShell (Admin)"** or **"Terminal (Admin)"**
3. Click **"Yes"** when prompted

**Step 2: Run These Commands**
```powershell
# Navigate to your project
cd E:\Gym

# Add Node.js to PATH for current session
$env:Path += ";C:\Program Files\nodejs"

# Verify it works
node --version
npm --version
```

**Step 3: Add to System PATH Permanently**
```powershell
# Get current PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

# Add Node.js if not already there
if ($currentPath -notlike "*C:\Program Files\nodejs*") {
    $newPath = $currentPath + ";C:\Program Files\nodejs"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
    Write-Host "Node.js added to PATH successfully!" -ForegroundColor Green
} else {
    Write-Host "Node.js is already in PATH!" -ForegroundColor Yellow
}
```

**Step 4: Restart Terminal**
- Close and reopen PowerShell (no need for Admin this time)

**Step 5: Verify and Install**
```powershell
cd E:\Gym
node --version
npm --version
npm install
npm run dev
```

---

### Method 3: Quick Temporary Fix (For Current Session Only)

If you just want to test quickly without changing system settings:

```powershell
# Add to current session PATH
$env:Path += ";C:\Program Files\nodejs"

# Verify
node --version
npm --version

# Now you can use npm
cd E:\Gym
npm install
npm run dev
```

**Note:** This only works for the current terminal session. You'll need to run the first command every time you open a new terminal.

---

### Troubleshooting

**If Method 1 doesn't work:**
1. Make sure you're editing **System variables** (not User variables)
2. Check the exact path: `C:\Program Files\nodejs` (no trailing backslash)
3. Restart your computer after adding to PATH
4. Try Method 2 (PowerShell Admin method)

**If you get "Access Denied":**
- Make sure you're running PowerShell as Administrator
- Or use Method 1 (GUI method) which doesn't require admin

**If Node.js is in a different location:**
- Search for `node.exe` on your system
- Use that path instead of `C:\Program Files\nodejs`

**To find Node.js location:**
```powershell
Get-ChildItem -Path "C:\Program Files" -Filter "node.exe" -Recurse -ErrorAction SilentlyContinue
Get-ChildItem -Path "C:\Program Files (x86)" -Filter "node.exe" -Recurse -ErrorAction SilentlyContinue
```

---

### Verification Checklist

After fixing PATH, verify everything works:

```powershell
# 1. Check Node.js version
node --version
# Should show: v20.x.x or similar

# 2. Check npm version
npm --version
# Should show: 10.x.x or similar

# 3. Navigate to project
cd E:\Gym

# 4. Install dependencies
npm install
# Should download packages

# 5. Start development server
npm run dev
# Should start Vite dev server
```

---

## Quick Reference Commands

```powershell
# Add to PATH (current session only)
$env:Path += ";C:\Program Files\nodejs"

# Add to PATH permanently (requires Admin)
$path = [Environment]::GetEnvironmentVariable("Path", "Machine")
[Environment]::SetEnvironmentVariable("Path", "$path;C:\Program Files\nodejs", "Machine")

# Verify installation
& "C:\Program Files\nodejs\node.exe" --version
& "C:\Program Files\nodejs\npm.cmd" --version
```



