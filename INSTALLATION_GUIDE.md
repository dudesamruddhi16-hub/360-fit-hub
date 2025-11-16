# Node.js Installation Guide for Windows

## Solution: Install Node.js

Since Node.js is not installed on your system, follow these steps:

### Option 1: Install Node.js (Recommended)

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version (recommended)
   - Choose the Windows Installer (.msi) for your system (64-bit or 32-bit)

2. **Run the Installer:**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - **IMPORTANT**: Make sure to check "Add to PATH" during installation
   - Click "Next" through the installation steps
   - Click "Install" and wait for completion

3. **Verify Installation:**
   - Close and reopen your PowerShell/Command Prompt
   - Run these commands to verify:
     ```powershell
     node --version
     npm --version
     ```
   - You should see version numbers (e.g., v20.10.0 and 10.2.3)

4. **If PATH is not set automatically:**
   - Open System Properties → Environment Variables
   - Under "System variables", find "Path" and click "Edit"
   - Add: `C:\Program Files\nodejs\`
   - Click OK on all dialogs
   - Restart your terminal

### Option 2: Install using Chocolatey (If you have it)

If you have Chocolatey package manager installed:
```powershell
choco install nodejs
```

### Option 3: Install using Winget (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

### After Installation

Once Node.js is installed:

1. **Close and reopen your terminal** (PowerShell/Command Prompt)

2. **Navigate to your project:**
   ```powershell
   cd E:\Gym
   ```

3. **Install project dependencies:**
   ```powershell
   npm install
   ```

4. **Start the development server:**
   ```powershell
   npm run dev
   ```

### Troubleshooting

**If Node.js is still not recognized after installation:**

1. **Check if Node.js is installed:**
   - Look in: `C:\Program Files\nodejs\`
   - If the folder exists, Node.js is installed but not in PATH

2. **Add Node.js to PATH manually:**
   - Press `Win + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", select "Path" and click "Edit"
   - Click "New" and add: `C:\Program Files\nodejs\`
   - Click OK on all dialogs
   - **Restart your terminal**

3. **Verify in new terminal:**
   ```powershell
   node --version
   npm --version
   ```

### Quick Check Commands

After installation, verify everything works:
```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if you're in the right directory
cd E:\Gym

# Install dependencies
npm install

# Start the app
npm run dev
```

### Need Help?

If you continue to have issues:
1. Make sure you downloaded the correct version (64-bit vs 32-bit)
2. Restart your computer after installation
3. Run PowerShell/Command Prompt as Administrator if needed
4. Check Windows Defender or antivirus isn't blocking Node.js



