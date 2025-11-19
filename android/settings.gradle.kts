// android/settings.gradle.kts
pluginManagement {
    val flutterSdkPath = settings.ext["flutter.sdk"] as String

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("dev.flutter.flutter-plugin-loader") version "1.0.0"
    id("com.android.application") version "8.5.0" apply false
    id("com.google.gms.google-services") version "4.4.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.23" apply false
}

include(":app")

// THIS IS THE MAGIC LINE THAT FIXES YOUR ERROR
project(":app").projectDir = file("app")