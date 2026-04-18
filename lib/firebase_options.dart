import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return ios;
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      case TargetPlatform.fuchsia:
        return android;
    }
  }

  // Replace these placeholder values by running `flutterfire configure`.
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'replace-with-flutterfire-config',
    appId: '1:000000000000:android:replace',
    messagingSenderId: '000000000000',
    projectId: 'tollbd-production',
    storageBucket: 'tollbd-production.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'replace-with-flutterfire-config',
    appId: '1:000000000000:ios:replace',
    messagingSenderId: '000000000000',
    projectId: 'tollbd-production',
    storageBucket: 'tollbd-production.appspot.com',
    iosClientId: 'replace-with-flutterfire-config',
    iosBundleId: 'com.example.tollbd',
  );
}
