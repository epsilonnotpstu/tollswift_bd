import 'package:fl_chart/fl_chart.dart';
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
import '../../domain/transaction_model.dart';
import '../providers/wallet_provider.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  String _filter = 'all';

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final hideBalance = ref.watch(hideBalanceProvider);
    final balance = ref.watch(walletBalanceProvider).valueOrNull ?? 0;
    final txList =
        ref.watch(transactionsProvider(_filter)).valueOrNull ?? const [];
    final weekly = ref.watch(weeklySpendingProvider);
    final totalSpent = weekly.fold<double>(0, (a, b) => a + b);

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
                children: [
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => context.go('/home'),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: 0.15),
                        ),
                        icon: const Icon(Icons.arrow_back,
                            color: Colors.white, size: 18),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        language == 'bn' ? 'ওয়ালেট' : 'My Wallet',
                        style: AppTextStyles.h3.copyWith(color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'Available Balance',
                    style:
                        AppTextStyles.bodySmall.copyWith(color: Colors.white70),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (hideBalance)
                        Row(
                          children: List.generate(
                            5,
                            (index) => Container(
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              width: 14,
                              height: 14,
                              decoration: const BoxDecoration(
                                color: Colors.white70,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        )
                      else
                        Text(
                          CurrencyFormatter.formatPaisa(balance),
                          style: const TextStyle(
                            fontFamily: 'RobotoMono',
                            fontSize: 42,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: -2,
                          ),
                        ),
                      IconButton(
                        onPressed: () =>
                            ref.read(hideBalanceProvider.notifier).toggle(),
                        icon: Icon(
                          hideBalance
                              ? Icons.visibility_off_rounded
                              : Icons.visibility_rounded,
                          color: Colors.white70,
                          size: 18,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.trending_down_rounded,
                          size: 12, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text(
                        '৳${totalSpent.toStringAsFixed(0)} spent in toll this month',
                        style: AppTextStyles.bodySmall
                            .copyWith(color: Colors.white70),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: FilledButton.icon(
                onPressed: () => context.push('/wallet/add'),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.accent,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(54),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                icon: const Icon(Icons.add_rounded),
                label: Text(
                  AppStrings.get('add_money', language),
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              padding: const EdgeInsets.all(AppSpacing.md),
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Spending (last 30 days)',
                      style: AppTextStyles.h4.copyWith(fontSize: 14)),
                  const SizedBox(height: AppSpacing.md),
                  SizedBox(
                    height: 95,
                    child: LineChart(
                      LineChartData(
                        gridData: const FlGridData(show: false),
                        titlesData: FlTitlesData(
                          topTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false)),
                          rightTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false)),
                          leftTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false)),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              reservedSize: 20,
                              interval: 1,
                              getTitlesWidget: (value, meta) {
                                return Text(
                                  '${value.toInt() + 1}',
                                  style: AppTextStyles.bodySmall,
                                );
                              },
                            ),
                          ),
                        ),
                        borderData: FlBorderData(show: false),
                        lineBarsData: [
                          LineChartBarData(
                            isCurved: true,
                            color: AppColors.primary,
                            barWidth: 2,
                            dotData: const FlDotData(show: false),
                            belowBarData: BarAreaData(
                              show: true,
                              color: AppColors.primary.withValues(alpha: 0.18),
                            ),
                            spots: List.generate(
                              weekly.length,
                              (index) =>
                                  FlSpot(index.toDouble(), weekly[index]),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.sm,
              ),
              child: Row(
                children: [
                  _FilterChip(
                    label: AppStrings.get('all', language),
                    active: _filter == 'all',
                    onTap: () => setState(() => _filter = 'all'),
                  ),
                  _FilterChip(
                    label: AppStrings.get('pay_toll', language),
                    active: _filter == 'toll',
                    onTap: () => setState(() => _filter = 'toll'),
                  ),
                  _FilterChip(
                    label: AppStrings.get('deposit', language),
                    active: _filter == 'deposit',
                    onTap: () => setState(() => _filter = 'deposit'),
                  ),
                  _FilterChip(
                    label: AppStrings.get('refund', language),
                    active: _filter == 'refund',
                    onTap: () => setState(() => _filter = 'refund'),
                  ),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                AppSpacing.xxl,
              ),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
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
              child: txList.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: Text(
                        AppStrings.get('no_transactions', language),
                        textAlign: TextAlign.center,
                      ),
                    )
                  : Column(
                      children: txList
                          .map(
                            (tx) => InkWell(
                              onTap: () =>
                                  context.push('/wallet/receipt?txId=${tx.id}'),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: AppSpacing.md,
                                ),
                                child: _WalletTransactionRow(
                                  transaction: tx,
                                  language: language,
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: AppSpacing.sm),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(99),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: active ? AppColors.primary : Colors.white,
            borderRadius: BorderRadius.circular(99),
            boxShadow: [
              BoxShadow(
                color: active
                    ? AppColors.primary.withValues(alpha: 0.3)
                    : Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            label,
            style: AppTextStyles.bodySmall.copyWith(
              color: active ? Colors.white : AppColors.textSecondary,
              fontWeight: active ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}

class _WalletTransactionRow extends StatelessWidget {
  const _WalletTransactionRow({
    required this.transaction,
    required this.language,
  });

  final TransactionModel transaction;
  final String language;

  @override
  Widget build(BuildContext context) {
    final icon = switch (transaction.type) {
      'deposit' => Icons.arrow_downward_rounded,
      'refund' => Icons.replay_rounded,
      _ => Icons.arrow_upward_rounded,
    };
    final iconColor = switch (transaction.type) {
      'deposit' => AppColors.success,
      'refund' => AppColors.info,
      _ => AppColors.error,
    };
    final isCredit = transaction.isCredit;
    return Row(
      children: [
        CircleAvatar(
          radius: 20,
          backgroundColor: iconColor.withValues(alpha: 0.12),
          child: Icon(icon, color: iconColor, size: 18),
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
                    .copyWith(fontWeight: FontWeight.w700),
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
          '${isCredit ? '+' : '-'} ${CurrencyFormatter.formatPaisa(transaction.amount)}',
          style: AppTextStyles.amountSmall.copyWith(
            color: isCredit ? AppColors.success : AppColors.error,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}
