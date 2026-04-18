import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/transaction_model.dart';
import '../providers/wallet_provider.dart';

class PaymentFailedScreen extends ConsumerWidget {
  const PaymentFailedScreen({super.key, required this.transactionId});

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
          error: (_, __) => _FailedContent(
            language: language,
            amountLabel: '৳0.00',
            transactionId: transactionId,
          ),
          data: (tx) => _FailedContent(
            language: language,
            amountLabel: CurrencyFormatter.formatPaisa(tx?.amount ?? 0),
            transactionId: tx?.id ?? transactionId,
          ),
        ),
      ),
    );
  }
}

class _FailedContent extends StatelessWidget {
  const _FailedContent({
    required this.language,
    required this.amountLabel,
    required this.transactionId,
  });

  final String language;
  final String amountLabel;
  final String transactionId;

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
              colors: [AppColors.accentDark, Color(0xFF8B0E1E)],
            ),
          ),
          child: Column(
            children: [
              const CircleAvatar(
                radius: 42,
                backgroundColor: Color(0x33FFFFFF),
                child: Icon(
                  Icons.cancel_rounded,
                  size: 56,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                language == 'bn' ? 'পেমেন্ট ব্যর্থ হয়েছে' : 'Payment Failed',
                style: AppTextStyles.h2.copyWith(color: Colors.white),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                language == 'bn'
                    ? 'লেনদেন সম্পন্ন করা যায়নি'
                    : 'We could not complete this transaction',
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  amountLabel,
                  style: AppTextStyles.amountLarge.copyWith(fontSize: 34),
                ),
                const SizedBox(height: AppSpacing.md),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.errorBg,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Text(
                    language == 'bn'
                        ? 'সম্ভবত নেটওয়ার্ক বা গেটওয়ে সমস্যার কারণে পেমেন্টটি সম্পন্ন হয়নি।'
                        : 'Payment did not complete due to a network or gateway issue.',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.error),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'Transaction ID: ${transactionId.isEmpty ? '-' : transactionId}',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.textHint),
                ),
              ],
            ),
          ),
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
          child: FilledButton(
            onPressed: () => context.go('/wallet/add'),
            style: FilledButton.styleFrom(
              minimumSize: const Size(double.infinity, 56),
              backgroundColor: AppColors.accent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.pill),
              ),
            ),
            child: Text(language == 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'),
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
          child: TextButton(
            onPressed: () => context.go('/home'),
            child: Text(
              language == 'bn' ? 'হোমে ফিরুন' : 'Back to Home',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
