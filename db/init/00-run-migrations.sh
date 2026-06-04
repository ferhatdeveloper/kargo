#!/bin/bash
set -euo pipefail

echo "Running Kargo DB migrations..."

for f in /migrations/*.sql; do
  echo "  -> $(basename "$f")"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done

if [ -f /seed/seed.sql ]; then
  echo "Running seed..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /seed/seed.sql
fi

echo "Migrations complete."
