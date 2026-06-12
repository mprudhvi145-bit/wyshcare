##
## ============================================================================
## WYSHCARE PLATFORM
## ============================================================================
##
## File: backend/scripts/scan-hook.sh
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
## Shell script: scan hook
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

#!/bin/sh

set -eu

LOG_FILE="${STORAGE_SCAN_LOG:-/var/lib/wyshcare/uploads/.scan-hook.log}"
mkdir -p "$(dirname "$LOG_FILE")"
printf '%s\n' "$1" >> "$LOG_FILE"
