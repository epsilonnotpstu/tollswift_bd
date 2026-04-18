import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/transaction_model.dart';
import '../providers/wallet_provider.dart';

class PaymentSuccessScreen extends ConsumerWidget {
  const PaymentSuccessScreen({super.key, required this.transactionId});

  final String transactionId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final txAsync = transactionId.isEmpty
        ? const AsyncValue<TransactionModel?>.data(null)
        : ref.watch(transactionByIdProvider(transactionId));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: txAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => _SuccessContent(
            language: language,
            amountLabel: '৳0.00',
            dateLabel: '-',
            transactionId: transactionId,
            onViewReceipt: () => context.go('/wallet/history'),
          ),
          data: (tx) {
            final amountLabel = CurrencyFormatter.formatPaisa(tx?.amount ?? 0);
            final dateLabel = tx == null
                ? '-'
                : DateFormatter.friendlyDate(tx.createdAt, language: language);
            return _SuccessContent(
              language: language,
              amountLabel: amountLabel,
              dateLabel: dateLabel,
              transactionId: tx?.id ?? transactionId,
              onViewReceipt: () {
                if (tx == null) {
                  context.go('/wallet/history');
                  return;
                }
                context.go('/wallet/receipt?txId=${tx.id}');
              },
            );
          },
        ),
      ),
    );
  }
}

class _SuccessContent extends StatelessWidget {
  const _SuccessContent({
    required this.language,
    required this.amountLabel,
    required this.dateLabel,
    required this.transactionId,
    required this.onViewReceipt,
  });

  final String language;
  final String amountLabel;
  final String dateLabel;
  final String transactionId;
  final VoidCallback onViewReceipt;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.xl,
            AppSpacing.xxxl,
            AppSpacing.xl,
            AppSpacing.xxxl,
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
              const CircleAvatar(
                radius: 42,
                backgroundColor: Color(0x33FFFFFF),
                child: Icon(
                  Icons.check_circle_rounded,
                  size: 56,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                language == 'bn' ? 'পেমেন্ট সফল হয়েছে' : 'Payment Successful',
                style: AppTextStyles.h2.copyWith(color: Colors.white),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                language == 'bn'
                    ? 'ওয়ালেটে টাকা যুক্ত করা হয়েছে'
                    : 'Money has been added to your wallet',
                style: AppTextStyles.bodyMedium.copyWith(color: Colors.white70),
              ),
            ],
          ),
        ),
        Transform.translate(
          offset: const Offset(0, -18),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x14000000),
                  blurRadius: 16,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              children: [
                Text(
                  amountLabel,
                  style: AppTextStyles.amountLarge.copyWith(fontSize: 34),
                ),
                const SizedBox(height: AppSpacing.lg),
                _InfoRow(
                  label: language == 'bn' ? 'তারিখ' : 'Date',
                  value: dateLabel,
                ),
                _InfoRow(
                  label: 'Transaction ID',
                  value: transactionId.isEmpty ? '-' : transactionId,
                ),
                _InfoRow(
                  label: language == 'bn' ? 'স্ট্যাটাস' : 'Status',
                  value: language == 'bn' ? 'সফল' : 'Success',
                  valueColor: AppColors.success,
                ),
              ],
            ),
          ),
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
          child: OutlinedButton(
            onPressed: onViewReceipt,
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 56),
              side: const BorderSide(color: AppColors.primary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.pill),
              ),
            ),
            child: Text(language == 'bn' ? 'রসিদ দেখুন' : 'View Receipt'),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.xl,
            0,
            AppSpacing.xl,
            AppSpacing.xl,
          ),
          child: FilledButton(
            onPressed: () => context.go('/home'),
            style: FilledButton.styleFrom(
              minimumSize: const Size(double.infinity, 56),
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.pill),
              ),
            ),
            child: Text(language == 'bn' ? 'হোমে ফিরুন' : 'Back to Home'),
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    this.valueColor = AppColors.textPrimary,
  });

  final String label;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style:
                  AppTextStyles.bodySmall.copyWith(color: AppColors.textHint),
            ),
          ),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              color: valueColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
