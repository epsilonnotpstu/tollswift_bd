import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/screens/biometric_setup_screen.dart';
import '../../features/auth/presentation/screens/language_select_screen.dart';
import '../../features/auth/presentation/screens/otp_verify_screen.dart';
import '../../features/auth/presentation/screens/phone_input_screen.dart';
import '../../features/auth/presentation/screens/profile_setup_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/home/presentation/screens/notification_screen.dart';
import '../../features/history/presentation/screens/dispute_screen.dart';
import '../../features/history/presentation/screens/receipt_detail_screen.dart';
import '../../features/history/presentation/screens/trip_history_screen.dart';
import '../../features/pass/presentation/screens/my_passes_screen.dart';
import '../../features/pass/presentation/screens/pass_store_screen.dart';
import '../../features/profile/presentation/screens/family_account_screen.dart';
import '../../features/profile/presentation/screens/help_screen.dart';
import '../../features/profile/presentation/screens/invite_member_screen.dart';
import '../../features/profile/presentation/screens/nid_verification_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/settings_screen.dart';
import '../../features/toll_payment/presentation/screens/nearby_gates_screen.dart';
import '../../features/toll_payment/presentation/screens/offline_qr_screen.dart';
import '../../features/toll_payment/presentation/screens/payment_confirm_screen.dart';
import '../../features/toll_payment/presentation/screens/payment_failed_screen.dart'
    as toll_payment;
import '../../features/toll_payment/presentation/screens/payment_success_screen.dart'
    as toll_payment;
import '../../features/toll_payment/presentation/screens/scan_qr_screen.dart';
import '../../features/toll_payment/presentation/screens/toll_estimator_screen.dart';
import '../../features/vehicle/presentation/screens/add_vehicle_screen.dart';
import '../../features/vehicle/presentation/screens/vehicle_detail_screen.dart';
import '../../features/vehicle/presentation/screens/vehicles_screen.dart';
import '../../features/wallet/presentation/screens/add_money_screen.dart';
import '../../features/wallet/presentation/screens/payment_failed_screen.dart';
import '../../features/wallet/presentation/screens/payment_success_screen.dart';
import '../../features/wallet/presentation/screens/receipt_screen.dart';
import '../../features/wallet/presentation/screens/sslcommerz_webview_screen.dart';
import '../../features/wallet/presentation/screens/transaction_history_screen.dart';
import '../../features/wallet/presentation/screens/wallet_screen.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_strings.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(path: '/', redirect: (_, __) => '/splash'),
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(
        path: '/language',
        builder: (_, __) => const LanguageSelectScreen(),
      ),
      GoRoute(path: '/phone', builder: (_, __) => const PhoneInputScreen()),
      GoRoute(
        path: '/otp',
        builder: (_, state) => OtpVerifyScreen(
          verificationId: Uri.decodeQueryComponent(
            state.uri.queryParameters['vid'] ?? '',
          ),
          phone: Uri.decodeQueryComponent(
            state.uri.queryParameters['phone'] ?? '',
          ),
        ),
      ),
      GoRoute(
        path: '/profile-setup',
        builder: (_, __) => const ProfileSetupScreen(),
      ),
      GoRoute(
        path: '/biometric-setup',
        builder: (_, state) => BiometricSetupScreen(
          mode: state.uri.queryParameters['mode'] ?? 'setup',
        ),
      ),
      GoRoute(path: '/wallet', builder: (_, __) => const WalletScreen()),
      GoRoute(
        path: '/wallet/add',
        builder: (_, state) =>
            AddMoneyScreen(errorMessage: state.uri.queryParameters['error']),
      ),
      GoRoute(
        path: '/wallet/webview',
        builder: (_, state) => SSLCommerzWebviewScreen(
          url: Uri.decodeComponent(state.uri.queryParameters['url'] ?? ''),
          transactionId: state.uri.queryParameters['txId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/wallet/payment-success',
        builder: (_, state) => PaymentSuccessScreen(
          transactionId: state.uri.queryParameters['txId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/wallet/payment-failed',
        builder: (_, state) => PaymentFailedScreen(
          transactionId: state.uri.queryParameters['txId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/wallet/history',
        builder: (_, __) => const TransactionHistoryScreen(),
      ),
      GoRoute(
        path: '/wallet/receipt',
        builder: (_, state) => ReceiptScreen(
          transactionId: state.uri.queryParameters['txId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/notifications',
        builder: (_, __) => const NotificationScreen(),
      ),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
      GoRoute(
        path: '/profile/family',
        builder: (_, __) => const FamilyAccountScreen(),
      ),
      GoRoute(
        path: '/profile/family/invite',
        builder: (_, state) => InviteMemberScreen(
          familyId: state.uri.queryParameters['familyId'] ?? '',
        ),
      ),
      GoRoute(path: '/profile/nid', builder: (_, __) => const NidVerificationScreen()),
      GoRoute(path: '/profile/help', builder: (_, __) => const HelpScreen()),
      GoRoute(
          path: '/vehicles/add', builder: (_, __) => const AddVehicleScreen()),
      GoRoute(
        path: '/vehicles/detail/:id',
        builder: (_, state) => VehicleDetailScreen(
          vehicleId: state.pathParameters['id'] ?? '',
        ),
      ),
      GoRoute(path: '/pay', builder: (_, __) => const ScanQrScreen()),
      GoRoute(
        path: '/pay/nearby-gates',
        builder: (_, __) => const NearbyGatesScreen(),
      ),
      GoRoute(
        path: '/pay/estimator',
        builder: (_, __) => const TollEstimatorScreen(),
      ),
      GoRoute(
        path: '/pay/offline',
        builder: (_, __) => const OfflineQrScreen(),
      ),
      GoRoute(
        path: '/pay/confirm',
        builder: (_, __) => const PaymentConfirmScreen(),
      ),
      GoRoute(
        path: '/pay/success',
        builder: (_, state) => toll_payment.TollPaymentSuccessScreen(
          paymentId: state.uri.queryParameters['paymentId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/pay/failed',
        builder: (_, state) => toll_payment.TollPaymentFailedScreen(
          paymentId: state.uri.queryParameters['paymentId'] ?? '',
        ),
      ),
      GoRoute(
          path: '/passes/store', builder: (_, __) => const PassStoreScreen()),
      GoRoute(path: '/passes/my', builder: (_, __) => const MyPassesScreen()),
      GoRoute(
        path: '/history/receipt',
        builder: (_, state) => ReceiptDetailScreen(
          paymentId: state.uri.queryParameters['paymentId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/history/dispute',
        builder: (_, state) => DisputeScreen(
          paymentId: state.uri.queryParameters['paymentId'] ?? '',
        ),
      ),
      ShellRoute(
        builder: (context, state, child) =>
            MainNavScaffold(location: state.uri.path, child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
          GoRoute(
            path: '/vehicles',
            builder: (_, __) => const VehiclesScreen(),
          ),
          GoRoute(
            path: '/history',
            builder: (_, __) => const TripHistoryScreen(),
          ),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),
    ],
  );
});

class MainNavScaffold extends ConsumerWidget {
  const MainNavScaffold({
    super.key,
    required this.location,
    required this.child,
  });

  final String location;
  final Widget child;

  int get currentIndex {
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/pay')) return 1;
    if (location.startsWith('/vehicles')) return 2;
    if (location.startsWith('/history')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.cardBorder)),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _NavItem(
                  active: currentIndex == 0,
                  icon: Icons.home_rounded,
                  label: AppStrings.get('app_name', language) == 'TollBD' &&
                          language == 'bn'
                      ? 'হোম'
                      : 'Home',
                  onTap: () => context.go('/home'),
                ),
                _NavItem(
                  active: currentIndex == 1,
                  icon: Icons.toll_rounded,
                  label: AppStrings.get('pay_toll', language),
                  center: true,
                  onTap: () => context.go('/pay'),
                ),
                _NavItem(
                  active: currentIndex == 2,
                  icon: Icons.directions_car_rounded,
                  label: AppStrings.get('vehicles', language),
                  onTap: () => context.go('/vehicles'),
                ),
                _NavItem(
                  active: currentIndex == 3,
                  icon: Icons.history_rounded,
                  label: language == 'bn' ? 'ইতিহাস' : 'History',
                  onTap: () => context.go('/history'),
                ),
                _NavItem(
                  active: currentIndex == 4,
                  icon: Icons.person_rounded,
                  label: AppStrings.get('profile', language),
                  onTap: () => context.go('/profile'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.active,
    required this.icon,
    required this.label,
    required this.onTap,
    this.center = false,
  });

  final bool active;
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool center;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              margin: const EdgeInsets.only(bottom: 2),
              height: 3,
              width: active ? 24 : 0,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(99),
              ),
            ),
            Container(
              padding: EdgeInsets.all(center ? 11 : 6),
              decoration: BoxDecoration(
                color: center
                    ? AppColors.accent
                    : active
                        ? AppColors.primary.withValues(alpha: 0.12)
                        : Colors.transparent,
                borderRadius: BorderRadius.circular(center ? 16 : 10),
                boxShadow: center
                    ? const [
                        BoxShadow(
                          color: Color(0x40F42A41),
                          blurRadius: 12,
                          offset: Offset(0, 4),
                        ),
                      ]
                    : null,
              ),
              child: Icon(
                icon,
                color: center
                    ? Colors.white
                    : active
                        ? AppColors.primary
                        : AppColors.textHint,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 11,
                color: active ? AppColors.primary : AppColors.textHint,
                fontWeight: active ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
