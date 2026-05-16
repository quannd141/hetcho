# HếtChờ Bootstrap (Windows PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "🌅 HếtChờ Bootstrap"
Write-Host ""

# 1. pnpm check
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "❌ pnpm not installed. Install:"
  Write-Host "    npm install -g pnpm@8.15.4"
  exit 1
}

# 2. Install
Write-Host "→ Installing dependencies (pnpm install)..."
pnpm install

# 3. Env
if (-not (Test-Path ".env.local")) {
  Write-Host "→ Creating .env.local from .env.example..."
  Copy-Item ".env.example" ".env.local"
  Write-Host "  ⚠️  Edit .env.local with your real credentials"
}

# 4. Build packages
Write-Host "→ Building workspace packages..."
pnpm --filter './packages/*' build

Write-Host ""
Write-Host "✅ Bootstrap complete. See PENDING_HUMAN.md for next steps."
