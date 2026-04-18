import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class TollPaymentFailedScreen extends ConsumerWidget {
  const TollPaymentFailedScreen({
    super.key,
    required this.paymentId,
  });

  final String paymentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            children: [
              const SizedBox(height: AppSpacing.xl),
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: AppColors.errorBg,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.2)),
                ),
                child: const Icon(
                  Icons.cancel_rounded,
                  color: AppColors.error,
                  size: 58,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                language == 'bn' ? 'পেমেন্ট ব্যর্থ হয়েছে' : 'Payment Failed',
                style: AppTextStyles.h2,
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                language == 'bn'
                    ? 'লেনদেন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।'
                    : 'Could not complete transaction. Please retry.',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.xl),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Transaction ID', style: AppTextStyles.bodySmall),
                    Text(
                      paymentId.isEmpty ? '-' : paymentId,
                      style: AppTextStyles.amountSmall,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      language == 'bn'
                          ? 'সম্ভাব্য কারণ: অপর্যাপ্ত ব্যালেন্স, গেটওয়ে/নেটওয়ার্ক ত্রুটি'
                          : 'Possible causes: insufficient balance, gateway/network issue',
                      style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              FilledButton(
                onPressed: () => context.go('/pay'),
                style: FilledButton.styleFrom(backgroundColor: AppColors.accent),
                child: Text(language == 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'),
              ),
              const SizedBox(height: AppSpacing.sm),
              TextButton(
                onPressed: () => context.go('/home'),
                child: Text(language == 'bn' ? 'হোমে ফিরুন' : 'Back to Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
