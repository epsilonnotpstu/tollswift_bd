import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_strings.dart';
import '../constants/app_text_styles.dart';
import '../utils/currency_formatter.dart';

class AnimatedBalanceCard extends StatelessWidget {
  const AnimatedBalanceCard({
    super.key,
    required this.balancePaisa,
    required this.language,
    required this.showBalance,
    required this.onToggleVisibility,
    this.onAddMoney,
    this.onHistory,
    this.height = 180,
  });

  final int balancePaisa;
  final String language;
  final bool showBalance;
  final VoidCallback onToggleVisibility;
  final VoidCallback? onAddMoney;
  final VoidCallback? onHistory;
  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: AppColors.walletGradient,
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            bottom: -16,
            child: Icon(
              Icons.route_rounded,
              size: 130,
              color: Colors.white.withValues(alpha: 0.1),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      AppStrings.get('your_balance', language),
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: onToggleVisibility,
                      icon: Icon(
                        showBalance
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 350),
                  transitionBuilder: (child, animation) =>
                      ScaleTransition(scale: animation, child: child),
                  child: Text(
                    showBalance
                        ? CurrencyFormatter.formatPaisa(balancePaisa)
                        : '৳ ••••••',
                    key: ValueKey('$showBalance-$balancePaisa'),
                    style: AppTextStyles.balanceAmount,
                  ),
                ),
                const Spacer(),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton(
                        onPressed: onAddMoney,
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.primary,
                        ),
                        child: Text(AppStrings.get('add_money', language)),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: onHistory,
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.white),
                          foregroundColor: Colors.white,
                        ),
                        child: Text(
                          AppStrings.get('transaction_history', language),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
