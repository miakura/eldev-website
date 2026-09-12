#!/usr/bin/env bash
set -euo pipefail
HOST="${1:-root@147.45.233.135}"
ROOT="${2:-/opt/eldev}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
RSH=(ssh -o StrictHostKeyChecking=accept-new)
if [[ -n "${SSHPASS:-}" ]] && command -v sshpass >/dev/null 2>&1; then
  RSH=(sshpass -e ssh -o StrictHostKeyChecking=accept-new)
fi
rsync -az --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .env \
  --exclude data/content.json \
  --exclude data/uploads \
  --exclude dist \
  -e "${RSH[*]}" \
  "$REPO/" "$HOST:$ROOT/"
"${RSH[@]}" "$HOST" "cd $ROOT && docker compose -f docker-compose.vps.yml up -d --build --force-recreate"
