import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

import '../firebase_options.dart';

class FirebaseService {
  static Future<FirebaseApp> initialize() async {
    if (Firebase.apps.isNotEmpty) {
      return Firebase.app();
    }

    if (kIsWeb ||
        defaultTargetPlatform == TargetPlatform.windows ||
        defaultTargetPlatform == TargetPlatform.linux ||
        defaultTargetPlatform == TargetPlatform.macOS) {
      return Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    }

    // On Android/iOS, use native config files to avoid duplicate default app init.
    return Firebase.initializeApp();
  }
}
