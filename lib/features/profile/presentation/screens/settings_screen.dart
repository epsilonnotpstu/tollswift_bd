import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _tollPaid = true;
  bool _lowBalance = true;
  bool _nearbyGate = true;
  bool _promotions = false;

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final biometricEnabled =
        ref.read(authControllerProvider).localBiometricEnabled;

    Future<void> onBiometricChanged(bool enabled) async {
      if (enabled) {
        final localAuth = LocalAuthentication();
        final authenticated = await localAuth.authenticate(
          localizedReason: 'Enable biometric for TollBD',
          options: const AuthenticationOptions(biometricOnly: true),
        );
        if (!authenticated) return;
      }
      await ref.read(authControllerProvider).saveBiometricEnabled(enabled);
      setState(() {});
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.xl,
              ),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primary, AppColors.primaryDark],
                ),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.go('/profile'),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.15),
                    ),
                    icon: const Icon(Icons.arrow_back,
                        color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    AppStrings.get('settings', language),
                    style: AppTextStyles.h3.copyWith(color: Colors.white),
                  ),
                ],
              ),
            ),
            _Section(
              title: 'Security',
              children: [
                _ToggleTile(
                  icon: Icons.fingerprint_rounded,
                  title: 'Biometric Login',
                  subtitle: 'Touch ID / Face ID',
                  value: biometricEnabled,
                  onChanged: onBiometricChanged,
                ),
                _ActionTile(
                  icon: Icons.lock_outline_rounded,
                  title: 'Change PIN',
                  subtitle: 'Update your 4-digit PIN',
                  onTap: () {},
                ),
                _ActionTile(
                  icon: Icons.shield_outlined,
                  title: 'Linked Accounts',
                  subtitle: 'bKash, Nagad, bank cards',
                  onTap: () {},
                ),
              ],
            ),
            _Section(
              title: 'Notifications',
              children: [
                _ToggleTile(
                  icon: Icons.notifications_none_rounded,
                  title: 'Toll Payment Alerts',
                  subtitle: 'When toll is deducted',
                  value: _tollPaid,
                  onChanged: (value) => setState(() => _tollPaid = value),
                ),
                _ToggleTile(
                  icon: Icons.notifications_none_rounded,
                  title: 'Low Balance Warning',
                  subtitle: 'When balance < ৳200',
                  value: _lowBalance,
                  onChanged: (value) => setState(() => _lowBalance = value),
                ),
                _ToggleTile(
                  icon: Icons.notifications_none_rounded,
                  title: 'Nearby Toll Gates',
                  subtitle: 'Route-based alerts',
                  value: _nearbyGate,
                  onChanged: (value) => setState(() => _nearbyGate = value),
                ),
                _ToggleTile(
                  icon: Icons.notifications_none_rounded,
                  title: 'Promotions & Offers',
                  subtitle: 'Pass deals and discounts',
                  value: _promotions,
                  onChanged: (value) => setState(() => _promotions = value),
                ),
              ],
            ),
            const _Section(
              title: 'About',
              children: [
                _ValueTile(label: 'App Version', value: 'v2.4.1'),
                _ValueTile(label: 'Build', value: '2026.04.18'),
                _ValueTile(label: 'Developer', value: 'BRTA Digital'),
              ],
            ),
            const SizedBox(height: 90),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.lg,
        0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style:
                AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: AppSpacing.sm),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x10000000),
                  blurRadius: 12,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Column(children: children),
          ),
        ],
      ),
    );
  }
}

class _ToggleTile extends StatelessWidget {
  const _ToggleTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: value
            ? AppColors.primary.withValues(alpha: 0.12)
            : AppColors.surfaceVariant,
        child: Icon(icon,
            color: value ? AppColors.primary : AppColors.textSecondary,
            size: 18),
      ),
      title: Text(title,
          style:
              AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: AppTextStyles.bodySmall),
      trailing: Switch(value: value, onChanged: onChanged),
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: CircleAvatar(
        backgroundColor: AppColors.surfaceVariant,
        child: Icon(icon, color: AppColors.textSecondary, size: 18),
      ),
      title: Text(title,
          style:
              AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: AppTextStyles.bodySmall),
      trailing:
          const Icon(Icons.chevron_right_rounded, color: AppColors.textHint),
    );
  }
}

class _ValueTile extends StatelessWidget {
  const _ValueTile({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(label, style: AppTextStyles.bodyMedium),
      trailing: Text(
        value,
        style: const TextStyle(
          fontFamily: 'RobotoMono',
          fontSize: 12,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}
