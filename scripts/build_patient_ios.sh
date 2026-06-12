##
## ============================================================================
## WYSHCARE PLATFORM
## ============================================================================
##
## File: scripts/build_patient_ios.sh
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
## Shell script: build patient ios
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
set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$WORKSPACE_DIR/apps/patient-mobile"

echo "============================================="
echo "WYSHCARE PATIENT MOBILE — iOS BUILD"
echo "============================================="

if ! command -v flutter &> /dev/null; then
  echo "Error: Flutter SDK is not installed or not in PATH."
  exit 1
fi

cd "$APP_DIR"
flutter pub get
flutter analyze || echo "Warnings found. Proceeding with build..."
flutter build ios --release --no-codesign

echo "iOS build output: $APP_DIR/build/ios/iphoneos/Runner.app"
echo "Open ios/Runner.xcworkspace in Xcode to archive and sign."
