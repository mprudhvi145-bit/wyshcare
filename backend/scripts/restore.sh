#!/bin/bash
set -euo pipefail

# WyshCare Database Restore Script
# Usage: ./scripts/restore.sh <backup-file>

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file>"
  echo "Supports: .sql.gz, .sql.gz.enc (encrypted)"
  exit 1
fi

BACKUP_FILE="$1"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/wyshcare}"

if [[ "$BACKUP_FILE" == *.enc ]]; then
  if [ -z "${MASTER_ENCRYPTION_KEY:-}" ]; then
    echo "Error: MASTER_ENCRYPTION_KEY required for encrypted backups"
    exit 1
  fi
  DECRYPTED="${BACKUP_FILE%.enc}"
  openssl enc -d -aes-256-cbc -salt -pass "pass:${MASTER_ENCRYPTION_KEY}" \
    -in "$BACKUP_FILE" -out "$DECRYPTED" 2>/dev/null || {
    echo "Error: Decryption failed (wrong key or corrupted file)"
    exit 1
  }
  gunzip -c "$DECRYPTED" | psql "$DB_URL"
  rm "$DECRYPTED"
elif [[ "$BACKUP_FILE" == *.sql.gz ]]; then
  gunzip -c "$BACKUP_FILE" | psql "$DB_URL"
elif [[ "$BACKUP_FILE" == *.sql ]]; then
  psql "$DB_URL" < "$BACKUP_FILE"
else
  echo "Unknown backup format. Use .sql, .sql.gz, or .sql.gz.enc"
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restore complete."
