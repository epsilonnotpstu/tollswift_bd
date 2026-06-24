#!/bin/bash
set -e

echo "═══════════════════════════════════════"
echo "  TollBD Android APK Build"
echo "═══════════════════════════════════════"

# 1. Build web
echo "▶ Building web app..."
cd "$(dirname "$0")/../web"
npm run build
echo "✓ Web build done"

# 2. Sync to Capacitor
echo "▶ Syncing Capacitor..."
cd "$(dirname "$0")"
npx cap sync android
echo "✓ Capacitor sync done"

# 3. Build APK
echo "▶ Building Android APK (debug)..."
cd android
./gradlew assembleDebug --quiet
echo "✓ APK built"

APK="$(pwd)/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "═══════════════════════════════════════"
echo "  APK ready: $APK"
echo "  Install: adb install $APK"
echo "═══════════════════════════════════════"
