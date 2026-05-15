#!/usr/bin/env bash
#
# Preflight checks before pushing to a remote.
#
# Block pushes that would obviously fail on Vercel. We've been bitten by two
# things in particular and a third worth catching:
#
#   1. Empty binary assets (icons / fonts) sneak in via misbehaving git
#      restores / IDE local-history reverts. Next 16 / Turbopack rejects
#      them at build time with "unable to decode image data" — but only
#      after a fresh CI build, so the failure is slow and remote.
#
#   2. Type errors. `next build` runs `tsc` in CI, so a broken typecheck
#      surfaces as a build error 30s into the deploy. Faster to catch here.
#
#   3. Lockfile drift. If `package.json` was edited without
#      `pnpm install`, the lockfile doesn't match — Vercel runs
#      `pnpm install --frozen-lockfile` and fails with "lockfile is not
#      up-to-date". Cheap to check locally.
#
# Set SKIP_PREFLIGHT=1 to bypass the whole hook (escape hatch for
# emergencies — don't make it a habit).
set -e

if [ "${SKIP_PREFLIGHT:-0}" = "1" ]; then
  echo "⚠️  SKIP_PREFLIGHT=1 set — bypassing all checks. Hope you know what you're doing."
  exit 0
fi

fail() {
  echo ""
  echo "❌ Preflight failed: $1"
  echo ""
  echo "    To bypass (emergencies only): SKIP_PREFLIGHT=1 git push"
  echo ""
  exit 1
}

echo "→ Checking critical binary assets are non-empty…"
CRITICAL=(
  "app/icon.png"
  "app/apple-icon.png"
  "app/fonts/sf-pro/sf-pro.woff2"
  "app/fonts/sf-pro/sf-pro-italic.woff2"
)
for f in "${CRITICAL[@]}"; do
  if [ ! -s "$f" ]; then
    fail "$f is empty or missing — Vercel will reject the build."
  fi
done
echo "  ✓ icons + fonts present and non-empty"

echo "→ Checking lockfile matches package.json…"
if ! pnpm install --frozen-lockfile --prefer-offline --silent >/dev/null 2>&1; then
  fail "pnpm-lock.yaml is out of sync with package.json. Run \`pnpm install\` and commit the lockfile."
fi
echo "  ✓ lockfile in sync"

echo "→ Running typecheck…"
if ! pnpm typecheck >/dev/null 2>&1; then
  echo ""
  pnpm typecheck || true
  fail "Typecheck failed (see output above)."
fi
echo "  ✓ typecheck clean"

echo ""
echo "✅ Preflight passed — pushing."
