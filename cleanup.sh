##
## ============================================================================
## WYSHCARE PLATFORM
## ============================================================================
##
## File: cleanup.sh
##
## Product:
## WyshCare Healthcare Operating System
##
## Brand:
## WYSH
##
## Founder:
## Vimarshak Prudhvi
##
## Purpose:
## Shell script: cleanup
##
## Responsibilities:
##  * - Automate operational tasks and CI/CD workflows
##
## Used By:
##  - Standalone (not imported by other source files)
##
## Calls:
##  - None identified
##
## Dependencies:
##  - None identified
##
## Security Notes:
## Standard authentication and authorization apply
##
## Business Domain:
## Infrastructure
##
## Last Reviewed:
## 2026-06-12
##
## ============================================================================
## (c) Wysh Technologies
## Built by Vimarshak Prudhvi
## All Rights Reserved
## ============================================================================
##

#!/bin/bash
# Cleanup script for WyshCare repository
# This script moves dead code and duplicate files to a backup directory.
# It is conservative and only moves files that are likely unused.

set -euo pipefail

BACKEND_DIR="./backend"
BACKUP_DIR="${BACKEND_DIR}/_backup_$(date +%Y%m%d_%H%M%S)"

echo "Creating backup directory: ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"

# List of files to move (dead code and duplicates)
FILES_TO_MOVE=(
    "abdm.service.js"
    "availability.service.js"
    "consent.service.js"
    "dashboard-analytics.service.js"
    "fix_events_publish_final.py"
    "fix_events_publish.py"
    "fix_events.py"
    "fix_first_publish.py"
    "fix_prescription_events.py"
    "fix_prescription_final.py"
    "fix_prescription_service.py"
    "fix_prescription_service2.py"
    "fix_prescription.py"
    "fix_remaining.py"
    "prescription_service_backup.ts"
    "prescription_service_orig.ts"
    "prisma-smoke-test.js"
    "README-AI-RISK-MODULE.md"
    "supabase_rebuild.sql"
    "supabase_schema.sql"
    "supabaseClient.js"
    "temp_service.ts"
    "temp.ts"
    "test.ts"
    "work.ts"
    "WYSHCARE_MAP.md"
    "db.js"
    "db.ts"
    "server.js"
    "server.mjs"
)

echo "Moving files to backup..."
for file in "${FILES_TO_MOVE[@]}"; do
    if [ -f "${BACKEND_DIR}/${file}" ]; then
        echo "  Moving ${file}"
        mv "${BACKEND_DIR}/${file}" "${BACKUP_DIR}/"
    else
        echo "  Warning: ${file} not found, skipping"
    fi
done

echo "Backup completed. Files moved to: ${BACKUP_DIR}"
echo "Please review the backup directory and verify that the application still works."
echo "If everything is correct, you can delete the backup directory."
