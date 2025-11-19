// lib/presentation/router/app_router.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:tollswift_bd/presentation/providers/auth_provider.dart';

// Import ALL your screens here — this removes the error!
import 'package:tollswift_bd/presentation/screens/splash/splash_screen.dart';
import 'package:tollswift_bd/presentation/screens/auth/login_screen.dart';
import 'package:tollswift_bd/presentation/screens/auth/register_screen.dart';
import 'package:tollswift_bd/presentation/screens/auth/phone_auth_screen.dart';
import 'package:tollswift_bd/presentation/screens/onboarding/onboarding_screen.dart';
import 'package:tollswift_bd/presentation/screens/dashboard/empty_dashboard_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isOnboardingDone = authState.value?.hasCompletedOnboarding ?? false;
      final path = state.uri.path;

      // Show splash while loading
      if (authState.isLoading || authState.isReloading) {
        return '/splash';
      }

      // Not logged in → force login (also redirect from splash)
      if (!isLoggedIn && !path.startsWith('/auth')) {
        return '/auth/login';
      }

      // Logged in but onboarding not done
      if (isLoggedIn && !isOnboardingDone && path != '/onboarding') {
        return '/onboarding';
      }

      // Logged in → don't allow access to auth screens
      if (isLoggedIn && (path.startsWith('/auth') || path == '/splash')) {
        return '/dashboard';
      }

      return null; // Allow normal navigation
    },
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/auth/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/auth/phone',
        name: 'phone_auth',
        builder: (context, state) => const PhoneAuthScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (context, state) => const EmptyDashboardScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
});
