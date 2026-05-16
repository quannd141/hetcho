#!/usr/bin/env bash
# ============================================================================
# HếtChờ — Bootstrap script (chạy 1 lần sau khi clone)
# ============================================================================
# Founder chạy: bash scripts/bootstrap.sh
# ============================================================================
set -euo pipefail

echo "🌅 HếtChờ Bootstrap"
echo ""

# 1. Check Node version
NODE_VERSION_FILE=".nvmrc"
REQUIRED_NODE=$(cat $NODE_VERSION_FILE)
CURRENT_NODE=$(node --version | sed 's/v//')
echo "→ Node required: $REQUIRED_NODE"
echo "→ Node current:  $CURRENT_NODE"

# 2. Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo ""
  echo "❌ pnpm not installed. Install:"
  echo "    npm install -g pnpm@8.15.4"
  exit 1
fi

# 3. Install deps
echo ""
echo "→ Installing dependencies (pnpm install)..."
pnpm install

# 4. Copy env if needed
if [ ! -f ".env.local" ]; then
  echo ""
  echo "→ Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "  ⚠️  Edit .env.local with your real credentials before running pnpm dev"
fi

# 5. Build packages (workspace deps)
echo ""
echo "→ Building workspace packages..."
pnpm --filter './packages/*' build || true

# 6. Print next steps
cat <<'EOF'

✅ Bootstrap complete.

Next steps:

  1. Verify PENDING_HUMAN.md and resolve blockers
     - Register Supabase project (PH-001)
     - Register Zalo OA + Mini App (PH-002)
     - Register VNPay sandbox merchant (PH-003)
     - Buy domain hetcho.vn (PH-004)
     - Register Vercel + Sentry + Better Stack accounts (PH-005)

  2. Edit .env.local with real credentials

  3. Run dev:
     pnpm dev

  4. Run tests:
     pnpm test

  5. To run in NIGHT_SHIFT_MODE (mock, local-only):
     NIGHT_SHIFT_MODE=true pnpm dev

EOF
