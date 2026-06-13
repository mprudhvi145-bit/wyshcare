#!/bin/bash
set -euo pipefail

# WyshCare Database Backup Script
# Usage: ./scripts/backup.sh [output-dir]

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/wyshcare}"
FILENAME="wyshcare_backup_${TIMESTAMP}.sql.gz"
ENCRYPTED_FILENAME="${FILENAME}.enc"

mkdir -p "$BACKUP_DIR"

# Extract connection details from DATABASE_URL
# Using pg_dump with connection string
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting PostgreSQL backup..."

# Dump and compress
pg_dump "$DB_URL" --clean --if-exists --no-owner | gzip > "${BACKUP_DIR}/${FILENAME}"

# Encrypt with MASTER_ENCRYPTION_KEY if available (AES-256-CBC via OpenSSL)
if [ -n "${MASTER_ENCRYPTION_KEY:-}" ]; then
  openssl enc -aes-256-cbc -salt -pass "pass:${MASTER_ENCRYPTION_KEY}" \
    -in "${BACKUP_DIR}/${FILENAME}" \
    -out "${BACKUP_DIR}/${ENCRYPTED_FILENAME}"
  rm "${BACKUP_DIR}/${FILENAME}"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup encrypted: ${BACKUP_DIR}/${ENCRYPTED_FILENAME}"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup created (unencrypted): ${BACKUP_DIR}/${FILENAME}"
fi

# Retain last 30 backups, remove older ones
ls -t "${BACKUP_DIR}"/*.sql.gz* 2>/dev/null | tail -n +31 | xargs -r rm

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete."
