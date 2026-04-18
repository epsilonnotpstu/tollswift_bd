import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../wallet/presentation/providers/wallet_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final profile = ref.watch(currentUserProfileProvider).valueOrNull;
    final balance = ref.watch(walletBalanceProvider).valueOrNull ?? 0;
    final title = profile == null
        ? (language == 'bn' ? 'ব্যবহারকারী' : 'User')
        : (language == 'bn' ? profile.nameBn : profile.name);
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.get('profile', language),
                    style: AppTextStyles.h3.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 32,
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                        backgroundImage: profile?.avatarUrl != null
                            ? CachedNetworkImageProvider(profile!.avatarUrl!)
                            : null,
                        child: profile?.avatarUrl == null
                            ? const Icon(Icons.person_outline,
                                color: Colors.white)
                            : null,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              style: AppTextStyles.h3
                                  .copyWith(color: Colors.white),
                            ),
                            Text(
                              profile?.phone ?? '',
                              style: AppTextStyles.bodySmall
                                  .copyWith(color: Colors.white70),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0x3310B981),
                                borderRadius: BorderRadius.circular(99),
                              ),
                              child: Text(
                                'NID Verified',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: const Color(0xFF4ADE80),
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                -14,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x14000000),
                    blurRadius: 20,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.language_rounded, color: AppColors.primary),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Language', style: AppTextStyles.bodyMedium),
                        Text(
                          language == 'bn' ? 'বাংলা' : 'English',
                          style: AppTextStyles.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  SegmentedButton<String>(
                    segments: const [
                      ButtonSegment(value: 'en', label: Text('EN')),
                      ButtonSegment(value: 'bn', label: Text('বাং')),
                    ],
                    selected: {language},
                    onSelectionChanged: (value) => ref
                        .read(languageProvider.notifier)
                        .setLanguage(value.first),
                  ),
                ],
              ),
            ),
            _Section(
              title: 'Account',
              children: [
                _ItemTile(
                  title: 'Wallet',
                  icon: Icons.account_balance_wallet_outlined,
                  suffixText: '৳${(balance / 100).toStringAsFixed(0)}',
                  onTap: () => context.go('/wallet'),
                ),
                _ItemTile(
                  title: 'My Vehicles',
                  icon: Icons.directions_car_outlined,
                  suffixText: '1 vehicle',
                  onTap: () => context.go('/vehicles'),
                ),
                _ItemTile(
                  title: 'My Passes',
                  icon: Icons.confirmation_num_outlined,
                  suffixText: '1 active',
                  onTap: () => context.go('/history'),
                ),
              ],
            ),
            _Section(
              title: 'Preferences',
              children: [
                _ItemTile(
                  title: AppStrings.get('notifications', language),
                  icon: Icons.notifications_none_rounded,
                  onTap: () => context.push('/notifications'),
                ),
                _ItemTile(
                  title: AppStrings.get('biometric', language),
                  icon: Icons.fingerprint_rounded,
                  suffixText: 'Enabled',
                  onTap: () => context.push('/settings'),
                ),
                _ItemTile(
                  title: AppStrings.get('settings', language),
                  icon: Icons.settings_outlined,
                  onTap: () => context.push('/settings'),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: FilledButton.icon(
                onPressed: () async {
                  await ref.read(authControllerProvider).signOut();
                  if (!context.mounted) return;
                  context.go('/language');
                },
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.errorBg,
                  foregroundColor: AppColors.error,
                ),
                icon: const Icon(Icons.logout_rounded),
                label: Text(AppStrings.get('logout', language)),
              ),
            ),
            const SizedBox(height: 100),
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
        0,
        AppSpacing.lg,
        AppSpacing.lg,
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

class _ItemTile extends StatelessWidget {
  const _ItemTile({
    required this.title,
    required this.icon,
    required this.onTap,
    this.suffixText,
  });

  final String title;
  final IconData icon;
  final VoidCallback onTap;
  final String? suffixText;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: CircleAvatar(
        backgroundColor: AppColors.surfaceVariant,
        child: Icon(icon, size: 18, color: AppColors.textPrimary),
      ),
      title: Text(title, style: AppTextStyles.bodyMedium),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (suffixText != null)
            Text(suffixText!, style: AppTextStyles.bodySmall),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right_rounded, color: AppColors.textHint),
        ],
      ),
    );
  }
}
