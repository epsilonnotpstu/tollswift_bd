import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _dotsController;

  @override
  void initState() {
    super.initState();
    _dotsController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
    _bootstrap();
  }

  @override
  void dispose() {
    _dotsController.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    await Future.delayed(const Duration(milliseconds: 2800));
    if (!mounted) return;

    final repo = ref.read(authRepositoryProvider);
    final user = repo.currentUser;
    if (user == null) {
      context.go('/language');
      return;
    }

    final profile = await repo.getUserProfile(user.uid);
    if (!mounted) return;
    if (profile == null) {
      context.go('/profile-setup');
      return;
    }

    final localBiometric =
        ref.read(authControllerProvider).localBiometricEnabled;
    if (profile.biometricEnabled || localBiometric) {
      context.go('/biometric-setup?mode=unlock');
      return;
    }

    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary,
              AppColors.primaryDark,
              Color(0xFF003322)
            ],
          ),
        ),
        child: Stack(
          children: [
            const Positioned(
              bottom: -50,
              left: -20,
              right: -20,
              child: Opacity(
                opacity: 0.1,
                child:
                    Icon(Icons.route_rounded, color: Colors.white, size: 260),
              ),
            ),
            Positioned(
              top: 160,
              right: 36,
              child: Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.accent.withValues(alpha: 0.15),
                ),
              ),
            ),
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    height: 94,
                    width: 94,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(28),
                      color: Colors.white.withValues(alpha: 0.15),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.toll_rounded,
                        color: Colors.white, size: 52),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  const Text(
                    'TollBD',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 40,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -1,
                      fontFamily: 'HindSiliguri',
                    ),
                  ),
                  Text(
                    'স্মার্ট টোল, সহজ যাত্রা',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: Colors.white70),
                  ),
                ],
              ),
            ),
            Positioned(
              bottom: 62,
              left: 0,
              right: 0,
              child: AnimatedBuilder(
                animation: _dotsController,
                builder: (context, child) {
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      3,
                      (index) {
                        final value =
                            (_dotsController.value + (index * 0.2)) % 1.0;
                        final opacity = 0.3 +
                            (1 - (value - 0.5).abs() * 2).clamp(0, 1) * 0.7;
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: opacity),
                            shape: BoxShape.circle,
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
            Positioned(
              bottom: AppSpacing.xl,
              left: 0,
              right: 0,
              child: Text(
                'v2.4.1 · Bangladesh Road Transport Authority',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodySmall.copyWith(color: Colors.white54),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
