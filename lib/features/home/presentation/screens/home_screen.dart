import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../wallet/domain/transaction_model.dart';
import '../../../wallet/presentation/providers/wallet_provider.dart';
import '../providers/home_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final profile = ref.watch(currentUserProfileProvider).valueOrNull;
    final hideBalance = ref.watch(hideBalanceProvider);
    final balance = ref.watch(walletBalanceProvider).valueOrNull ?? 0;
    final recentTransactions =
        ref.watch(recentTransactionsProvider).valueOrNull ?? const [];
    final greeting = ref.watch(greetingProvider);
    final unreadNotifications = ref.watch(unreadNotificationCountProvider);
    final displayName = language == 'bn'
        ? (profile?.nameBn.isNotEmpty == true
            ? profile!.nameBn
            : profile?.name ?? 'ব্যবহারকারী')
        : (profile?.name ?? 'User');

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(currentUserProfileProvider);
            ref.invalidate(walletBalanceProvider);
            ref.invalidate(recentTransactionsProvider);
          },
          child: ListView(
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.lg,
                      AppSpacing.lg,
                      84,
                    ),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [AppColors.primary, AppColors.primaryDark],
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '$greeting 🌤️',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: Colors.white70,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    displayName,
                                    style: AppTextStyles.h3.copyWith(
                                      color: Colors.white,
                                      fontSize: 20,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Stack(
                              clipBehavior: Clip.none,
                              children: [
                                IconButton(
                                  onPressed: () => context.push('/notifications'),
                                  style: IconButton.styleFrom(
                                    backgroundColor:
                                        Colors.white.withValues(alpha: 0.15),
                                  ),
                                  icon: const Icon(
                                    Icons.notifications_none_rounded,
                                    color: Colors.white,
                                  ),
                                ),
                                if (unreadNotifications > 0)
                                  Positioned(
                                    right: 4,
                                    top: 4,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 5, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: AppColors.accent,
                                        borderRadius: BorderRadius.circular(99),
                                      ),
                                      child: Text(
                                        unreadNotifications > 99
                                            ? '99+'
                                            : unreadNotifications.toString(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 9,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24),
                            color: Colors.white.withValues(alpha: 0.12),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.2),
                            ),
                          ),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Text(
                                    'Wallet Balance',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: Colors.white70,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const Spacer(),
                                  IconButton(
                                    onPressed: () => ref
                                        .read(hideBalanceProvider.notifier)
                                        .toggle(),
                                    icon: Icon(
                                      hideBalance
                                          ? Icons.visibility_off_outlined
                                          : Icons.visibility_outlined,
                                      color: Colors.white70,
                                      size: 18,
                                    ),
                                  ),
                                ],
                              ),
                              AnimatedSwitcher(
                                duration: const Duration(milliseconds: 220),
                                child: hideBalance
                                    ? Row(
                                        key: const ValueKey('hidden'),
                                        mainAxisSize: MainAxisSize.min,
                                        children: List.generate(
                                          5,
                                          (index) => Container(
                                            margin: const EdgeInsets.symmetric(
                                                horizontal: 3),
                                            width: 14,
                                            height: 14,
                                            decoration: const BoxDecoration(
                                              color: Colors.white70,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                        ),
                                      )
                                    : Text(
                                        CurrencyFormatter.formatPaisa(balance),
                                        key: const ValueKey('shown'),
                                        style: const TextStyle(
                                          fontFamily: 'RobotoMono',
                                          fontSize: 34,
                                          fontWeight: FontWeight.w700,
                                          color: Colors.white,
                                          letterSpacing: -1,
                                        ),
                                      ),
                              ),
                              const SizedBox(height: AppSpacing.sm),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.trending_up_rounded,
                                    color: Colors.white70,
                                    size: 13,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '৳1,040 this month',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: Colors.white70,
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.md),
                                  const Icon(
                                    Icons.flash_on_rounded,
                                    color: AppColors.warning,
                                    size: 13,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Monthly pass active',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: Colors.white70,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Positioned(
                    left: AppSpacing.lg,
                    right: AppSpacing.lg,
                    bottom: -40,
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x14000000),
                            blurRadius: 20,
                            offset: Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Row(
                        children: [
                          Expanded(
                            child: _QuickAction(
                              icon: Icons.qr_code_2_rounded,
                              labelBn: 'টোল দিন',
                              labelEn: 'Pay Toll',
                              color: AppColors.primary,
                              bg: Color(0xFFE8F5F1),
                              route: '/pay',
                            ),
                          ),
                          Expanded(
                            child: _QuickAction(
                              icon: Icons.add_circle_outline_rounded,
                              labelBn: 'টাকা যোগ',
                              labelEn: 'Add Money',
                              color: AppColors.accent,
                              bg: Color(0xFFFEF3F2),
                              route: '/wallet/add',
                            ),
                          ),
                          Expanded(
                            child: _QuickAction(
                              icon: Icons.history_rounded,
                              labelBn: 'ইতিহাস',
                              labelEn: 'History',
                              color: AppColors.info,
                              bg: Color(0xFFEFF6FF),
                              route: '/history',
                            ),
                          ),
                          Expanded(
                            child: _QuickAction(
                              icon: Icons.confirmation_num_outlined,
                              labelBn: 'পাস',
                              labelEn: 'Pass',
                              color: Color(0xFF8B5CF6),
                              bg: Color(0xFFF5F3FF),
                              route: '/passes/store',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 56),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  0,
                  AppSpacing.lg,
                  AppSpacing.md,
                ),
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: AppColors.infoBg,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.qr_code_rounded,
                            color: AppColors.info, size: 18),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          language == 'bn'
                              ? 'অফলাইন QR তৈরি করুন'
                              : 'Generate Offline QR',
                          style: AppTextStyles.bodyMedium.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: () => context.push('/pay/offline'),
                        child: Text(language == 'bn' ? 'খুলুন' : 'Open'),
                      ),
                    ],
                  ),
                ),
              ),
              if (balance < 20000)
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF8E6),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0x33F59E0B)),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.warning_amber_rounded,
                          color: AppColors.warning,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                AppStrings.get('low_balance_warning', language),
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: const Color(0xFF92400E),
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                CurrencyFormatter.formatPaisa(balance),
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: const Color(0xFFB45309),
                                ),
                              ),
                            ],
                          ),
                        ),
                        FilledButton(
                          onPressed: () => context.push('/wallet/add'),
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.warning,
                            foregroundColor: Colors.white,
                            minimumSize: const Size(10, 32),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                          ),
                          child: const Text('Add'),
                        ),
                      ],
                    ),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.lg,
                  0,
                ),
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x10000000),
                        blurRadius: 12,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        height: 40,
                        width: 40,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          color: const Color(0xFFE8F5F1),
                        ),
                        child: const Icon(Icons.directions_car_outlined),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              AppStrings.get('active_vehicle', language),
                              style: AppTextStyles.bodySmall,
                            ),
                            const SizedBox(height: 3),
                            const _LicensePlate('DHAKA METRO GA 11-1111'),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.successBg,
                          borderRadius: BorderRadius.circular(99),
                        ),
                        child: Text(
                          'Verified',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.success,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.md,
                  AppSpacing.lg,
                  0,
                ),
                child: OutlinedButton.icon(
                  onPressed: () => context.push('/pay/estimator'),
                  icon: const Icon(Icons.alt_route_rounded),
                  label: Text(
                    language == 'bn'
                        ? 'যাত্রাপথ পরিকল্পনাকারী'
                        : 'Route Toll Estimator',
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.lg,
                  0,
                ),
                child: Row(
                  children: [
                    Text(
                      language == 'bn' ? 'কাছের টোল গেট' : 'Nearby Toll Gates',
                      style: AppTextStyles.h4,
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () => context.go('/pay/nearby-gates'),
                      child: const Text('View all'),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 122,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  children: const [
                    _GateCard(
                      nameBn: 'যমুনা সেতু',
                      nameEn: 'Jamuna Bridge',
                      distance: '2.3 km',
                      amount: 60,
                      active: true,
                    ),
                    _GateCard(
                      nameBn: 'মেঘনা সেতু',
                      nameEn: 'Meghna Bridge',
                      distance: '5.1 km',
                      amount: 40,
                      active: true,
                    ),
                    _GateCard(
                      nameBn: 'পদ্মা সেতু',
                      nameEn: 'Padma Bridge',
                      distance: '12.7 km',
                      amount: 200,
                      active: true,
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.md,
                  AppSpacing.lg,
                  AppSpacing.sm,
                ),
                child: Row(
                  children: [
                    Text(
                      AppStrings.get('recent_transactions', language),
                      style: AppTextStyles.h4,
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () => context.push('/wallet/history'),
                      child: Text(AppStrings.get('see_all', language)),
                    ),
                  ],
                ),
              ),
              if (recentTransactions.isEmpty)
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: _EmptyTransactions(language: language),
                )
              else
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.md),
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
                  child: Column(
                    children: recentTransactions
                        .map(
                          (tx) => InkWell(
                            onTap: () =>
                                context.push('/wallet/receipt?txId=${tx.id}'),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: AppSpacing.md,
                              ),
                              child: _TransactionRow(
                                transaction: tx,
                                language: language,
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ),
              const SizedBox(height: 90),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickAction extends ConsumerWidget {
  const _QuickAction({
    required this.icon,
    required this.labelBn,
    required this.labelEn,
    required this.color,
    required this.bg,
    required this.route,
  });

  final IconData icon;
  final String labelBn;
  final String labelEn;
  final Color color;
  final Color bg;
  final String route;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    return InkWell(
      onTap: () => context.go(route),
      borderRadius: BorderRadius.circular(12),
      child: Column(
        children: [
          Container(
            height: 48,
            width: 48,
            decoration: BoxDecoration(
                color: bg, borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 6),
          Text(
            language == 'bn' ? labelBn : labelEn,
            style: AppTextStyles.bodySmall.copyWith(
              color: const Color(0xFF374151),
              fontWeight: FontWeight.w700,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _LicensePlate extends StatelessWidget {
  const _LicensePlate(this.plate);
  final String plate;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFF5C518),
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: const Color(0xFF1A1A1A), width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 4,
            height: 13,
            margin: const EdgeInsets.only(right: 6),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Text(
            plate,
            style: const TextStyle(
              fontFamily: 'RobotoMono',
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1A1A1A),
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }
}

class _GateCard extends ConsumerWidget {
  const _GateCard({
    required this.nameBn,
    required this.nameEn,
    required this.distance,
    required this.amount,
    required this.active,
  });

  final String nameBn;
  final String nameEn;
  final String distance;
  final int amount;
  final bool active;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    return Container(
      width: 148,
      margin: const EdgeInsets.only(right: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x10000000),
            blurRadius: 12,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: active ? AppColors.success : AppColors.warning,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 5),
              Text(
                active ? 'active' : 'maintenance',
                style: AppTextStyles.bodySmall.copyWith(
                  color: active ? AppColors.success : AppColors.warning,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            language == 'bn' ? nameBn : nameEn,
            style:
                AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              const Icon(Icons.location_on_outlined,
                  size: 11, color: AppColors.textHint),
              const SizedBox(width: 2),
              Text(distance, style: AppTextStyles.bodySmall),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5F1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '৳$amount / car',
              style: const TextStyle(
                fontFamily: 'RobotoMono',
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TransactionRow extends StatelessWidget {
  const _TransactionRow({required this.transaction, required this.language});

  final TransactionModel transaction;
  final String language;

  @override
  Widget build(BuildContext context) {
    final isCredit = transaction.isCredit;
    final color = isCredit ? AppColors.success : AppColors.error;
    final icon = switch (transaction.type) {
      'deposit' => Icons.arrow_downward_rounded,
      'refund' => Icons.replay_rounded,
      _ => Icons.arrow_upward_rounded,
    };
    return Row(
      children: [
        CircleAvatar(
          radius: 20,
          backgroundColor: color.withValues(alpha: 0.12),
          child: Icon(icon, color: color, size: 18),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                language == 'bn'
                    ? (transaction.descriptionBn ?? transaction.description)
                    : transaction.description,
                style: AppTextStyles.bodyMedium
                    .copyWith(fontWeight: FontWeight.w600),
              ),
              Text(
                DateFormatter.friendlyDate(transaction.createdAt,
                    language: language),
                style: AppTextStyles.bodySmall,
              ),
            ],
          ),
        ),
        Text(
          '${isCredit ? '+' : '-'} ৳${(transaction.amount / 100).toStringAsFixed(0)}',
          style: TextStyle(
            fontFamily: 'RobotoMono',
            fontSize: 13,
            color: color,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _EmptyTransactions extends StatelessWidget {
  const _EmptyTransactions({required this.language});

  final String language;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          const Icon(Icons.receipt_long_outlined,
              color: AppColors.textHint, size: 48),
          const SizedBox(height: AppSpacing.sm),
          Text(AppStrings.get('no_transactions', language)),
        ],
      ),
    );
  }
}
