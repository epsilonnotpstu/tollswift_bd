import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../history/presentation/providers/history_provider.dart';
import '../../presentation/providers/toll_provider.dart';

class TollPaymentSuccessScreen extends ConsumerStatefulWidget {
  const TollPaymentSuccessScreen({super.key, required this.paymentId});

  final String paymentId;

  @override
  ConsumerState<TollPaymentSuccessScreen> createState() =>
      _TollPaymentSuccessScreenState();
}

class _TollPaymentSuccessScreenState
    extends ConsumerState<TollPaymentSuccessScreen> {
  Timer? _timer;
  int _secondsLeft = 8;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft <= 1) {
        timer.cancel();
        if (mounted) context.go('/home');
      } else {
        setState(() => _secondsLeft -= 1);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final pid = widget.paymentId.isEmpty
        ? (ref.read(lastTollPaymentIdProvider) ?? '')
        : widget.paymentId;
    final paymentAsync = pid.isEmpty
        ? const AsyncValue.data(null)
        : ref.watch(receiptPaymentProvider(pid));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: paymentAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(child: Text(error.toString())),
          data: (payment) {
            final amount = payment?.amount ?? 0;
            final balance = payment?.balanceAfter ?? 0;
            final createdAt = payment?.createdAt ?? DateTime.now();
            final txId = payment?.id ?? pid;

            return ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                Lottie.asset(
                  'assets/animations/success_check.json',
                  height: 120,
                  repeat: false,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  language == 'bn' ? 'গেট খুলছে! ✓' : 'Gate opening! ✓',
                  style: AppTextStyles.h2.copyWith(color: AppColors.primary),
                  textAlign: TextAlign.center,
                ),
                Text(
                  language == 'bn' ? 'টোল পরিশোধ সম্পন্ন' : 'Toll payment complete',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.lg),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Column(
                    children: [
                      _Item(
                        label: language == 'bn' ? 'Gate' : 'Gate',
                        value: payment?.gateName ?? '-',
                      ),
                      _Item(
                        label: language == 'bn' ? 'Vehicle' : 'Vehicle',
                        value: payment?.vehiclePlate ?? '-',
                      ),
                      _Item(
                        label: language == 'bn' ? 'Amount paid' : 'Amount paid',
                        value: CurrencyFormatter.formatPaisa(amount),
                        valueStyle: AppTextStyles.amountSmall.copyWith(
                          color: AppColors.success,
                        ),
                      ),
                      _Item(
                        label: language == 'bn' ? 'New balance' : 'New balance',
                        value: CurrencyFormatter.formatPaisa(balance),
                      ),
                      _Item(
                        label: language == 'bn' ? 'Time' : 'Time',
                        value: DateFormatter.friendlyDate(
                          createdAt,
                          language: language,
                        ),
                      ),
                      _Item(
                        label: 'Transaction ID',
                        value: txId,
                        trailing: IconButton(
                          onPressed: () async {
                            await Clipboard.setData(ClipboardData(text: txId));
                            if (!mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(language == 'bn'
                                    ? 'Transaction ID কপি হয়েছে'
                                    : 'Transaction ID copied'),
                              ),
                            );
                          },
                          icon: const Icon(Icons.copy_rounded, size: 18),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                OutlinedButton.icon(
                  onPressed: () => context.push('/history/receipt?paymentId=$txId'),
                  icon: const Icon(Icons.picture_as_pdf_rounded),
                  label: Text(language == 'bn'
                      ? 'রসিদ ডাউনলোড করুন'
                      : 'Download Receipt'),
                ),
                const SizedBox(height: AppSpacing.sm),
                FilledButton(
                  onPressed: () => context.go('/home'),
                  child: Text(language == 'bn' ? 'হোমে ফিরুন' : 'Back to Home'),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  language == 'bn'
                      ? '$_secondsLeft সেকেন্ড পরে হোমে যাবে'
                      : 'Navigating home in $_secondsLeft seconds',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodySmall,
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _Item extends StatelessWidget {
  const _Item({
    required this.label,
    required this.value,
    this.trailing,
    this.valueStyle,
  });

  final String label;
  final String value;
  final Widget? trailing;
  final TextStyle? valueStyle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Expanded(child: Text(label, style: AppTextStyles.bodySmall)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: valueStyle ?? AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}
