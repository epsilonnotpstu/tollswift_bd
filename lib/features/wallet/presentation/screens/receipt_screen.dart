import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../core/widgets/error_view.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/wallet_provider.dart';

class ReceiptScreen extends ConsumerWidget {
  const ReceiptScreen({super.key, required this.transactionId});

  final String transactionId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final txAsync = ref.watch(transactionByIdProvider(transactionId));
    return Scaffold(
      appBar: AppBar(title: Text(language == 'bn' ? 'রসিদ' : 'Receipt')),
      body: txAsync.when(
        loading: () => const Padding(
          padding: EdgeInsets.all(AppSpacing.lg),
          child: SkeletonLoader(height: 260),
        ),
        error: (error, stackTrace) => ErrorView(message: error.toString()),
        data: (tx) {
          if (tx == null) {
            return Center(
              child: Text(
                language == 'bn'
                    ? 'লেনদেন পাওয়া যায়নি'
                    : 'Transaction not found',
              ),
            );
          }
          final isCredit = tx.isCredit;
          return ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.xl),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Icon(
                        isCredit
                            ? Icons.check_circle
                            : Icons.receipt_long_rounded,
                        color: isCredit ? AppColors.success : AppColors.primary,
                        size: 54,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    _RowItem(
                      label: language == 'bn'
                          ? 'Transaction ID'
                          : 'Transaction ID',
                      value: tx.id,
                    ),
                    _RowItem(
                      label: language == 'bn' ? 'তারিখ' : 'Date',
                      value: DateFormatter.friendlyDate(
                        tx.createdAt,
                        language: language,
                      ),
                    ),
                    _RowItem(
                      label: language == 'bn' ? 'বর্ণনা' : 'Description',
                      value: language == 'bn'
                          ? (tx.descriptionBn ?? tx.description)
                          : tx.description,
                    ),
                    _RowItem(
                      label: language == 'bn' ? 'স্ট্যাটাস' : 'Status',
                      value: tx.status,
                    ),
                    _RowItem(
                      label: language == 'bn'
                          ? 'পেমেন্ট পদ্ধতি'
                          : 'Payment Method',
                      value: tx.paymentMethod ?? '-',
                    ),
                    const Divider(),
                    _RowItem(
                      label: language == 'bn' ? 'পরিমাণ' : 'Amount',
                      value:
                          '${isCredit ? '+' : '-'} ${CurrencyFormatter.formatPaisa(tx.amount)}',
                      valueStyle: AppTextStyles.amountMedium.copyWith(
                        color: isCredit ? AppColors.success : AppColors.error,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _RowItem extends StatelessWidget {
  const _RowItem({required this.label, required this.value, this.valueStyle});

  final String label;
  final String value;
  final TextStyle? valueStyle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 2, child: Text(label, style: AppTextStyles.bodySmall)),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            flex: 3,
            child: Text(value, style: valueStyle ?? AppTextStyles.bodyMedium),
          ),
        ],
      ),
    );
  }
}
