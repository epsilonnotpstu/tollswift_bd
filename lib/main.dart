import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/app_theme_dark.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'services/firebase_service.dart';
import 'services/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  Object? bootstrapError;
  StackTrace? bootstrapStackTrace;

  try {
    await FirebaseService.initialize();
    await Hive.initFlutter();
  } catch (error, stackTrace) {
    bootstrapError = error;
    bootstrapStackTrace = stackTrace;
  }

  final sharedPrefs = await SharedPreferences.getInstance();

  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(sharedPrefs)],
      child: TollBdApp(
        bootstrapError: bootstrapError,
        bootstrapStackTrace: bootstrapStackTrace,
      ),
    ),
  );

  // Keep startup responsive; initialize notifications after first frame.
  if (bootstrapError == null) {
    unawaited(NotificationService().initialize());
  }
}

class TollBdApp extends ConsumerWidget {
  const TollBdApp({
    super.key,
    this.bootstrapError,
    this.bootstrapStackTrace,
  });

  final Object? bootstrapError;
  final StackTrace? bootstrapStackTrace;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (bootstrapError != null) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: _BootstrapErrorScreen(
          error: bootstrapError!,
          stackTrace: bootstrapStackTrace,
        ),
      );
    }

    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'TollBD',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppThemeDark.darkTheme,
      routerConfig: router,
    );
  }
}

class _BootstrapErrorScreen extends StatelessWidget {
  const _BootstrapErrorScreen({
    required this.error,
    required this.stackTrace,
  });

  final Object error;
  final StackTrace? stackTrace;
  // to do

  @override
  Widget build(BuildContext context) {
    final errorText = error.toString();
    final lowerError = errorText.toLowerCase();
    final isDuplicateFirebaseApp = lowerError.contains('duplicate-app') ||
        lowerError.contains('already exists');
    final isFirebaseConfigIssue =
        errorText.contains('replace-with-flutterfire-config') ||
            lowerError.contains('missingpluginexception');

    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.error_outline_rounded, color: Colors.red),
                          SizedBox(width: 8),
                          Text(
                            'App initialization failed',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        isDuplicateFirebaseApp
                            ? 'Firebase was initialized more than once. The app now guards this, so please restart the app fully.'
                            : isFirebaseConfigIssue
                                ? 'Firebase config is missing/invalid. Run flutterfire configure and restart the app.'
                                : 'The app failed to initialize. Check the error below and runtime logs.',
                      ),
                      const SizedBox(height: 12),
                      Text(
                        errorText,
                        style: const TextStyle(
                          fontFamily: 'RobotoMono',
                          fontSize: 12,
                        ),
                      ),
                      if (stackTrace != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          stackTrace.toString().split('\n').take(5).join('\n'),
                          style: const TextStyle(
                            fontFamily: 'RobotoMono',
                            fontSize: 11,
                            color: Colors.black54,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
