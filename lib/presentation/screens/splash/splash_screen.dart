// lib/presentation/screens/splash/splash_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';
// auth_provider import removed (not used in splash)

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _lottieController;

  @override
  void initState() {
    super.initState();
    _lottieController = AnimationController(vsync: this);

    // Optional: Add delay or wait for auth state if needed
    // But GoRouter already handles it via redirect → no need here
  }

  @override
  void dispose() {
    _lottieController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // App Logo with Gradient Background
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF1A73E8), // Google Blue
                    Color(0xFF4285F4),
                  ],
                ),
                borderRadius: BorderRadius.circular(32),
                boxShadow: [
                  BoxShadow(
                    color: Color.fromRGBO(26, 115, 232, 0.3),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(
                Icons.account_balance_wallet_rounded,
                color: Colors.white,
                size: 68,
              ),
            ),

            const SizedBox(height: 48),

            // App Name
            Text(
              'TollSwift BD',
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                    letterSpacing: 1.2,
                  ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 8),

            // Tagline
            Text(
              'Cashless Toll Revolution',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 64),

            // Lottie Loading Animation
            SizedBox(
              width: 100,
              height: 100,
              child: Lottie.asset(
                'lib/assets/lottie/loading_bridge.json', // ← Use registered asset path
                controller: _lottieController,
                onLoaded: (composition) {
                  _lottieController
                    ..duration = composition.duration
                    ..repeat();
                },
              ),
            ),

            const SizedBox(height: 32),

            // Powered by text (optional)
            Text(
              'Powered by xAI & Firebase',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context)
                        .colorScheme
                        .onSurfaceVariant
                        .withAlpha((0.6 * 255).round()),
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
