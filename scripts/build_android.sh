##
## ============================================================================
## WYSHCARE PLATFORM
## ============================================================================
##
## File: scripts/build_android.sh
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
## Shell script: build android
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

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "WYSHCARE DOCTOR MOBILE — PRODUCTION BUILD ENGINE"
echo "============================================="

# Define paths relative to workspace root
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$WORKSPACE_DIR/apps/doctor-mobile"

echo "Workspace Root: $WORKSPACE_DIR"
echo "Target App Directory: $APP_DIR"

# Ensure flutter is available
if ! command -v flutter &> /dev/null; then
    echo "Error: Flutter SDK is not installed or not in PATH."
    exit 1
fi

echo "Using Flutter: $(flutter --version | head -n 1)"

# Move to app directory
cd "$APP_DIR"

# Resolve dependencies
echo "Resolving dependencies..."
flutter pub get

# Run analyzer
echo "Running static analysis..."
flutter analyze || echo "Warnings found during analysis. Proceeding with build..."

# Build release APK
echo "Building Production Release APK..."
flutter build apk --release --build-name=1.0.0 --build-number=1

# Build release App Bundle (AAB)
echo "Building Production Release App Bundle (AAB)..."
flutter build appbundle --release --build-name=1.0.0 --build-number=1

echo "============================================="
echo "BUILD COMPLETED SUCCESSFULLY!"
echo "Outputs generated:"
echo "APK: $APP_DIR/build/app/outputs/flutter-apk/app-release.apk"
echo "AAB: $APP_DIR/build/app/outputs/bundle/release/app-release.aab"
echo "============================================="
