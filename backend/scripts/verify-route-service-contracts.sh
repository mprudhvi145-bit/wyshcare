##
## ============================================================================
## WYSHCARE PLATFORM
## ============================================================================
##
## File: backend/scripts/verify-route-service-contracts.sh
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
## Shell script: verify route service contracts
##
## Responsibilities:
##  * - Execute business logic for infrastructure operations
 * - Coordinate data access and external API calls
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
set -e

echo "🔍 Verifying route ↔ service contracts (imports only)..."

IGNORE_IMPORTS=(
  authenticate
  authenticateOptional
  auditMiddleware
  authorize
  authorizeStaff
  requireRole
)

is_ignored () {
  for i in "${IGNORE_IMPORTS[@]}"; do
    [[ "$1" == "$i" ]] && return 0
  done
  return 1
}

for r in routes/*.js; do
  while read -r line; do
    service=$(echo "$line" | sed -E "s/.*from '(.*)'.*/\1/" | sed 's|../services/||')

    [[ ! -f "services/$service" ]] && {
      echo "⚠️  $r → service not found: $service"
      continue
    }

    imports=$(echo "$line" \
      | sed -E 's/import\s*\{//; s/\}\s*from.*//' \
      | tr ',' '\n' \
      | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    exports=$(node -e "import('./services/$service').then(m=>console.log(Object.keys(m).join('\n')))" 2>/dev/null)

    for fn in $imports; do
      is_ignored "$fn" && continue

      echo "$exports" | grep -qx "$fn" || \
        echo "❌ $r → $service :: missing '$fn'"
    done

  done < <(grep -E "^import\s*\{.*\}\s*from\s*'\.\./services/.*\.service\.js'" "$r")
done

echo "✅ Route ↔ service verification complete"