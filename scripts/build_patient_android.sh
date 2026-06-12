##
## ============================================================================
## WYSHCARE PLATFORM
## ============================================================================
##
## File: scripts/build_patient_android.sh
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
## Shell script: build patient android
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
echo "WYSHCARE PATIENT MOBILE — ANDROID BUILD"
echo "============================================="

if ! command -v flutter &> /dev/null; then
  echo "Error: Flutter SDK is not installed or not in PATH."
  exit 1
fi

cd "$APP_DIR"
flutter pub get
flutter analyze || echo "Warnings found. Proceeding with build..."
flutter build apk --release --build-name=1.0.0 --build-number=1
flutter build appbundle --release --build-name=1.0.0 --build-number=1

echo "APK: $APP_DIR/build/app/outputs/flutter-apk/app-release.apk"
echo "AAB: $APP_DIR/build/app/outputs/bundle/release/app-release.aab"
