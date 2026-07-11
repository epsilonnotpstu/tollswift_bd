#!/bin/bash
# TollBD: web build → cap sync → APK build → phone install
set -e

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export ANDROID_HOME=/home/afrin/Android/Sdk
export PATH="$PATH:$ANDROID_HOME/platform-tools"

echo "▶ Building web..."
cd /home/afrin/Documents/TollBD/apps/web && npm run build

echo "▶ Syncing Capacitor..."
cd /home/afrin/Documents/TollBD/apps/mobile && npx cap sync android

echo "▶ Building APK..."
cd /home/afrin/Documents/TollBD/apps/mobile/android && ./gradlew assembleDebug --quiet

echo "▶ Setting ADB reverse tunnel (API port)..."
adb reverse tcp:3001 tcp:3001

echo "▶ Installing on phone..."
adb install -r app/build/outputs/apk/debug/app-debug.apk

echo ""
echo "✅ TollBD installed on phone!"
echo "   Make sure API is running: cd api && npm run dev"
