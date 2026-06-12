##
## ============================================================================
## WYSHCARE PLATFORM
## ============================================================================
##
## File: k6/run.sh
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
## Shell script: run
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
set -euo pipefail

SCENARIO="${1:-smoke}"
BASE_URL="${BASE_URL:-http://localhost:3001/api/v1}"

echo "Running k6 scenario: $SCENARIO"
echo "Target: $BASE_URL"

k6 run \
  --out json="reports/${SCENARIO}-$(date +%Y%m%d-%H%M%S).json" \
  -e BASE_URL="$BASE_URL" \
  "scenarios/${SCENARIO}.js"
