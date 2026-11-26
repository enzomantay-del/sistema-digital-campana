#!/usr/bin/env bash
# Copia de seguridad del código (sin node_modules ni .next). Uso: ./scripts/backup-proyecto.sh [destino]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
DEST="${1:-$ROOT/../cercalud-backup-codigo-$STAMP.tar.gz}"
cd "$ROOT/.."
tar -czf "$DEST" \
  --exclude='donde-atenderse/node_modules' \
  --exclude='donde-atenderse/.next' \
  --exclude='donde-atenderse/.next-prod' \
  --exclude='donde-atenderse/prisma/dev.db' \
  --exclude='donde-atenderse/public/uploads' \
  donde-atenderse
echo "Backup creado: $DEST"