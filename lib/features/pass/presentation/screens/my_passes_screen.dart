import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/pass_provider.dart';

class MyPassesScreen extends ConsumerWidget {
  const MyPassesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final passesAsync = ref.watch(passesProvider);
    return Scaffold(
      appBar: AppBar(
        title: Text(language == 'bn' ? 'আমার পাস' : 'My Passes'),
      ),
      body: passesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
        data: (passes) {
          if (passes.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.confirmation_num_outlined, size: 54),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    language == 'bn' ? 'কোনো পাস নেই' : 'No active passes',
                    style: AppTextStyles.h4,
                  ),
                  TextButton(
                    onPressed: () => context.push('/passes/store'),
                    child: Text(language == 'bn' ? 'পাস কিনুন' : 'Buy pass'),
                  ),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemBuilder: (context, index) {
              final pass = passes[index];
              final active = pass.isActive;
              return Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(
                    color: active ? AppColors.primary : AppColors.cardBorder,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          pass.passType.toUpperCase(),
                          style: AppTextStyles.h4,
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: active
                                ? AppColors.successBg
                                : AppColors.warningBg,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            active
                                ? (language == 'bn' ? 'সক্রিয়' : 'ACTIVE')
                                : (language == 'bn' ? 'মেয়াদ শেষ' : 'EXPIRED'),
                            style: AppTextStyles.bodySmall.copyWith(
                              color: active
                                  ? AppColors.success
                                  : AppColors.warning,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '${language == 'bn' ? 'মূল্য' : 'Price'}: ${CurrencyFormatter.formatPaisa(pass.price)}',
                            style: AppTextStyles.bodySmall,
                          ),
                        ),
                        Text(
                          language == 'bn'
                              ? '${pass.daysLeft} দিন বাকি'
                              : '${pass.daysLeft} days left',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: pass.daysLeft < 10
                                ? AppColors.warning
                                : AppColors.textSecondary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      '${language == 'bn' ? 'মেয়াদ' : 'Valid until'}: ${pass.validUntil.toLocal()}',
                      style: AppTextStyles.bodySmall,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    if (pass.daysLeft <= 10)
                      FilledButton(
                        onPressed: () => context.push('/passes/store'),
                        child: Text(language == 'bn' ? 'রিনিউ করুন' : 'Renew'),
                      ),
                  ],
                ),
              );
            },
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
            itemCount: passes.length,
          );
        },
      ),
    );
  }
}
