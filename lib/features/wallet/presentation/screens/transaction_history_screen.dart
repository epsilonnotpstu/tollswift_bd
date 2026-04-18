import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../core/widgets/error_view.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/transaction_model.dart';
import '../providers/wallet_provider.dart';

class TransactionHistoryScreen extends ConsumerWidget {
  const TransactionHistoryScreen({super.key, this.showAppBar = true});

  final bool showAppBar;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final txAsync = ref.watch(transactionsProvider('all'));
    return Scaffold(
      appBar: showAppBar
          ? AppBar(title: Text(AppStrings.get('transaction_history', language)))
          : null,
      body: txAsync.when(
        loading: () => ListView.builder(
          itemCount: 8,
          padding: const EdgeInsets.all(AppSpacing.lg),
          itemBuilder: (_, __) => const Padding(
            padding: EdgeInsets.only(bottom: AppSpacing.sm),
            child: SkeletonLoader(height: 72),
          ),
        ),
        error: (error, stackTrace) => ErrorView(message: error.toString()),
        data: (transactions) {
          if (transactions.isEmpty) {
            return Center(
              child: Text(AppStrings.get('no_transactions', language)),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: transactions.length,
            itemBuilder: (_, index) {
              final tx = transactions[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: _HistoryTile(transaction: tx, language: language),
              );
            },
          );
        },
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({required this.transaction, required this.language});

  final TransactionModel transaction;
  final String language;

  @override
  Widget build(BuildContext context) {
    final isCredit = transaction.isCredit;
    return ListTile(
      onTap: () => context.push('/wallet/receipt?txId=${transaction.id}'),
      tileColor: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        side: const BorderSide(color: AppColors.cardBorder),
      ),
      leading: CircleAvatar(
        backgroundColor: isCredit ? AppColors.successBg : AppColors.errorBg,
        child: Icon(
          isCredit ? Icons.add : Icons.remove,
          color: isCredit ? AppColors.success : AppColors.error,
        ),
      ),
      title: Text(
        language == 'bn'
            ? (transaction.descriptionBn ?? transaction.description)
            : transaction.description,
        style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
      ),
      subtitle: Text(
        DateFormatter.friendlyDate(transaction.createdAt, language: language),
      ),
      trailing: Text(
        '${isCredit ? '+' : '-'} ${CurrencyFormatter.formatPaisa(transaction.amount)}',
        style: AppTextStyles.amountSmall.copyWith(
          color: isCredit ? AppColors.success : AppColors.error,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
