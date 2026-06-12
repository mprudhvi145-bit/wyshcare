##
## ============================================================================
## WYSHCARE PLATFORM
## ============================================================================
##
## File: infra/docker/backend-entrypoint.sh
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
## Shell script: backend entrypoint
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

cd /app/backend

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Starting WyshCare backend..."
exec node dist/backend/src/main.js
