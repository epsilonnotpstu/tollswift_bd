import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/loading_overlay.dart';
import '../../../../core/widgets/toll_button.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/wallet_provider.dart';

class AddMoneyScreen extends ConsumerStatefulWidget {
  const AddMoneyScreen({super.key, this.errorMessage});

  final String? errorMessage;

  @override
  ConsumerState<AddMoneyScreen> createState() => _AddMoneyScreenState();
}

class _AddMoneyScreenState extends ConsumerState<AddMoneyScreen> {
  final _amountController = TextEditingController();
  String? _selectedMethod;
  bool _loading = false;
  int? _selectedQuickAmount;

  static const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  num get _amount => num.tryParse(_amountController.text.trim()) ?? 0;

  Future<void> _proceed() async {
    final language = ref.read(languageProvider);
    final amount = _amount;
    final validation = Validators.validateAmount(amount, language: language);
    if (validation != null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(validation)));
      return;
    }
    if (_selectedMethod == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            language == 'bn'
                ? 'পেমেন্ট পদ্ধতি বেছে নিন'
                : 'Please select payment method',
          ),
        ),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final (paymentUrl, txId) =
          await ref.read(walletActionControllerProvider).createSession(
                amountPaisa: CurrencyFormatter.takaToPaisa(amount),
                paymentMethod: _selectedMethod!,
              );
      if (!mounted) return;
      context.push(
          '/wallet/webview?url=${Uri.encodeComponent(paymentUrl)}&txId=$txId');
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final amount = _amount;
    final amountError = amount > 0
        ? Validators.validateAmount(amount, language: language)
        : null;
    final proceedEnabled =
        amount > 0 && _selectedMethod != null && amountError == null;
    return LoadingOverlay(
      loading: _loading,
      child: Scaffold(
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
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => context.go('/wallet'),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white.withValues(alpha: 0.15),
                      ),
                      icon: const Icon(Icons.arrow_back,
                          color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      language == 'bn' ? 'টাকা যোগ করুন' : 'Add Money',
                      style: AppTextStyles.h3.copyWith(color: Colors.white),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (widget.errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.errorBg,
                          borderRadius: BorderRadius.circular(AppRadius.md),
                        ),
                        child: Text(
                          widget.errorMessage!,
                          style: AppTextStyles.bodySmall
                              .copyWith(color: AppColors.error),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                    ],
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.lg),
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
                          const Text(
                            'Enter Amount',
                            style: AppTextStyles.bodySmall,
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Row(
                            children: [
                              const Text(
                                '৳',
                                style: TextStyle(
                                  fontFamily: 'HindSiliguri',
                                  fontSize: 32,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextField(
                                  controller: _amountController,
                                  keyboardType:
                                      const TextInputType.numberWithOptions(
                                    decimal: true,
                                  ),
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontFamily: 'RobotoMono',
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                  ),
                                  inputFormatters: [
                                    FilteringTextInputFormatter.allow(
                                      RegExp(r'^\d+\.?\d{0,2}'),
                                    ),
                                  ],
                                  decoration: const InputDecoration(
                                    hintText: '0.00',
                                    border: UnderlineInputBorder(
                                      borderSide: BorderSide(
                                          color: AppColors.primary, width: 2),
                                    ),
                                    enabledBorder: UnderlineInputBorder(
                                      borderSide: BorderSide(
                                          color: AppColors.primary, width: 2),
                                    ),
                                    focusedBorder: UnderlineInputBorder(
                                      borderSide: BorderSide(
                                          color: AppColors.primary, width: 2),
                                    ),
                                    filled: false,
                                  ),
                                  onChanged: (_) => setState(
                                      () => _selectedQuickAmount = null),
                                ),
                              ),
                            ],
                          ),
                          if (amountError != null) ...[
                            const SizedBox(height: AppSpacing.sm),
                            Text(
                              amountError,
                              style: AppTextStyles.bodySmall
                                  .copyWith(color: AppColors.error),
                            ),
                          ],
                          const SizedBox(height: AppSpacing.sm),
                          Wrap(
                            spacing: AppSpacing.sm,
                            runSpacing: AppSpacing.sm,
                            children: quickAmounts
                                .map(
                                  (value) => ChoiceChip(
                                    selected: _selectedQuickAmount == value,
                                    onSelected: (_) {
                                      setState(() {
                                        _selectedQuickAmount = value;
                                        _amountController.text =
                                            value.toString();
                                      });
                                    },
                                    selectedColor: AppColors.primary,
                                    labelStyle: TextStyle(
                                      fontFamily: 'RobotoMono',
                                      fontWeight: FontWeight.w600,
                                      color: _selectedQuickAmount == value
                                          ? Colors.white
                                          : AppColors.textPrimary,
                                    ),
                                    label: Text(
                                        '৳${NumberFormatters.comma(value)}'),
                                  ),
                                )
                                .toList(),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      AppStrings.get('select_payment_method', language),
                      style: AppTextStyles.h4,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    _PaymentMethodCard(
                      title: 'bKash',
                      subtitle: language == 'bn'
                          ? 'মোবাইল ব্যাংকিং'
                          : 'Mobile banking',
                      color: AppColors.bkashColor,
                      iconText: '📱',
                      selected: _selectedMethod == 'bkash',
                      onTap: () => setState(() => _selectedMethod = 'bkash'),
                    ),
                    _PaymentMethodCard(
                      title: 'Nagad',
                      subtitle: language == 'bn'
                          ? 'মোবাইল ব্যাংকিং'
                          : 'Mobile banking',
                      color: AppColors.nagadColor,
                      iconText: '🟠',
                      selected: _selectedMethod == 'nagad',
                      onTap: () => setState(() => _selectedMethod = 'nagad'),
                    ),
                    _PaymentMethodCard(
                      title: 'Rocket',
                      subtitle: language == 'bn'
                          ? 'মোবাইল ব্যাংকিং'
                          : 'DBBL mobile banking',
                      color: AppColors.rocketColor,
                      iconText: '🚀',
                      selected: _selectedMethod == 'rocket',
                      onTap: () => setState(() => _selectedMethod = 'rocket'),
                    ),
                    _PaymentMethodCard(
                      title: language == 'bn'
                          ? 'ডেবিট/ক্রেডিট কার্ড'
                          : 'Debit / Credit Card',
                      subtitle: 'Visa, Mastercard via SSLCommerz',
                      color: AppColors.info,
                      iconText: '💳',
                      selected: _selectedMethod == 'card',
                      onTap: () => setState(() => _selectedMethod = 'card'),
                    ),
                    _PaymentMethodCard(
                      title: language == 'bn'
                          ? 'ইন্টারনেট ব্যাংকিং'
                          : 'Internet Banking',
                      subtitle: 'All BD banks supported',
                      color: AppColors.textSecondary,
                      iconText: '🏦',
                      selected: _selectedMethod == 'netbanking',
                      onTap: () =>
                          setState(() => _selectedMethod = 'netbanking'),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Center(
                      child: Text(
                        AppStrings.get('secure_payment', language),
                        style: AppTextStyles.bodySmall,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    TollButton(
                      label: AppStrings.get(
                        'pay_amount',
                        language,
                        args: {
                          'amount': _amountController.text.isEmpty
                              ? '0.00'
                              : _amountController.text,
                        },
                      ),
                      color: AppColors.accent,
                      onPressed: proceedEnabled && !_loading ? _proceed : null,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PaymentMethodCard extends StatelessWidget {
  const _PaymentMethodCard({
    required this.title,
    required this.subtitle,
    required this.color,
    required this.iconText,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final Color color;
  final String iconText;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: selected ? color.withValues(alpha: 0.08) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected
                  ? color.withValues(alpha: 0.35)
                  : AppColors.cardBorder,
              width: selected ? 2 : 1.2,
            ),
          ),
          child: Row(
            children: [
              Container(
                height: 38,
                width: 38,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(iconText, style: const TextStyle(fontSize: 20)),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.bodyMedium
                          .copyWith(fontWeight: FontWeight.w700),
                    ),
                    Text(subtitle, style: AppTextStyles.bodySmall),
                  ],
                ),
              ),
              Icon(
                selected
                    ? Icons.check_circle_rounded
                    : Icons.radio_button_unchecked_rounded,
                color: selected ? color : AppColors.textHint,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class NumberFormatters {
  static String comma(int value) {
    final chars = value.toString().split('').reversed.toList();
    final out = <String>[];
    for (var i = 0; i < chars.length; i++) {
      if (i > 0 && i % 3 == 0) out.add(',');
      out.add(chars[i]);
    }
    return out.reversed.join();
  }
}
