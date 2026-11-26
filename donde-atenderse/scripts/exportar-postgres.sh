#!/usr/bin/env bash
# Volcado SQL de la base de producción. Requiere DATABASE_URL en el entorno y `pg_dump` instalado.
# Uso: set -a && source .env && set +a && ./scripts/exportar-postgres.sh salida.sql
set -euo pipefail
OUT="${1:-cercalud-produccion-$(date -u +%Y%m%d).sql}"
URL="${DATABASE_URL:-}"
if [[ -z "$URL" ]]; then
  echo "Definí DATABASE_URL (Postgres) antes de exportar." >&2
  exit 1
fi
if [[ "$URL" != postgres://* && "$URL" != postgresql://* ]]; then
  echo "DATABASE_URL no es Postgres; no hay nada que exportar con pg_dump." >&2
  exit 1
fi
if ! command -v pg_dump >/dev/null; then
  echo "Instalá el cliente PostgreSQL (pg_dump) en tu PC o usá el panel de Neon/Supabase." >&2
  exit 1
fi
pg_dump "$URL" --no-owner --no-acl --file="$OUT"
echo "Volcado guardado: $OUT"