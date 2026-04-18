import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../vehicle/presentation/providers/vehicle_provider.dart';
import '../../../wallet/presentation/providers/wallet_provider.dart';
import '../providers/pass_provider.dart';

class PassStoreScreen extends ConsumerStatefulWidget {
  const PassStoreScreen({super.key});

  @override
  ConsumerState<PassStoreScreen> createState() => _PassStoreScreenState();
}

class _PassStoreScreenState extends ConsumerState<PassStoreScreen> {
  String _vehicleType = 'car';
  bool _purchasing = false;

  static const _vehicleTypes = [
    ('motorcycle', '🏍️', 'মোটরসাইকেল', 'Motorcycle'),
    ('car', '🚗', 'গাড়ি', 'Car'),
    ('microbus', '🚐', 'মাইক্রোবাস', 'Microbus'),
    ('truck', '🚛', 'ট্রাক', 'Truck'),
    ('bus', '🚌', 'বাস', 'Bus'),
  ];

  static const _pricing = {
    'monthly': {'motorcycle': 30000, 'car': 50000, 'microbus': 70000, 'truck': 100000, 'bus': 120000},
    'quarterly': {'motorcycle': 80000, 'car': 130000, 'microbus': 180000, 'truck': 260000, 'bus': 300000},
    'annual': {'motorcycle': 260000, 'car': 450000, 'microbus': 650000, 'truck': 920000, 'bus': 1050000},
  };

  int _priceOf(String passType) {
    return _pricing[passType]?[_vehicleType] ?? 0;
  }

  Future<void> _buyPass(String passType) async {
    final language = ref.read(languageProvider);
    final vehicle = ref.read(activeVehicleProvider);
    if (vehicle == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(language == 'bn' ? 'প্রথমে গাড়ি যোগ করুন' : 'Add a vehicle first')),
      );
      return;
    }
    final price = _priceOf(passType);
    final balance = ref.read(walletBalanceProvider).valueOrNull ?? 0;
    if (balance < price) {
      final shortfall = price - balance;
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(language == 'bn'
              ? '${CurrencyFormatter.formatPaisa(shortfall)} কম আছে — টাকা যোগ করুন'
              : 'Short by ${CurrencyFormatter.formatPaisa(shortfall)} - add money'),
          action: SnackBarAction(
            label: language == 'bn' ? 'টাকা যোগ' : 'Add',
            onPressed: () => context.push('/wallet/add'),
          ),
        ),
      );
      return;
    }

    final confirm = await showModalBottomSheet<bool>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                language == 'bn' ? 'পাস ক্রয় নিশ্চিত করুন' : 'Confirm pass purchase',
                style: AppTextStyles.h4,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                '${language == 'bn' ? 'গাড়ি' : 'Vehicle'}: ${vehicle.plateNumber}',
                style: AppTextStyles.bodySmall,
              ),
              Text(
                '${language == 'bn' ? 'ধরন' : 'Type'}: $passType',
                style: AppTextStyles.bodySmall,
              ),
              Text(
                '${language == 'bn' ? 'মূল্য' : 'Price'}: ${CurrencyFormatter.formatPaisa(price)}',
                style: AppTextStyles.amountSmall,
              ),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: Text(language == 'bn' ? 'নিশ্চিত করুন' : 'Confirm'),
              ),
            ],
          ),
        );
      },
    );
    if (confirm != true) return;
    if (_purchasing) return;
    setState(() => _purchasing = true);
    try {
      await ref.read(passActionsProvider).purchasePass(
            vehicleId: vehicle.id,
            vehicleType: _vehicleType,
            passType: passType,
          );
      if (!mounted) return;
      context.push('/passes/my');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _purchasing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(language == 'bn' ? 'টোল পাস' : 'Toll Passes'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(
            language == 'bn'
                ? 'FastPass লেনে সুবিধাজনক যাতায়াত করুন'
                : 'Get easy access with FastPass lanes',
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            height: 42,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _vehicleTypes.length,
              separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
              itemBuilder: (context, index) {
                final item = _vehicleTypes[index];
                final selected = _vehicleType == item.$1;
                return ChoiceChip(
                  selected: selected,
                  label: Text(
                    '${item.$2} ${language == 'bn' ? item.$3 : item.$4}',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: selected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  selectedColor: AppColors.primary,
                  onSelected: (_) => setState(() => _vehicleType = item.$1),
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          _PassCard(
            language: language,
            titleBn: 'মাসিক পাস',
            titleEn: 'Monthly Pass',
            passType: 'monthly',
            duration: language == 'bn' ? '৩০ দিন' : '30 days',
            gradient: const [AppColors.primary, AppColors.primaryLight],
            price: _priceOf('monthly'),
            savings: language == 'bn' ? '৳300 সাশ্রয়' : 'Save ৳300',
            features: [
              language == 'bn' ? 'সকল জাতীয় মহাসড়ক টোল গেট' : 'All national highways',
              language == 'bn' ? 'FastPass লেন অ্যাক্সেস' : 'FastPass lane access',
              language == 'bn' ? 'স্বয়ংক্রিয় পেমেন্ট' : 'Automatic payment',
              language == 'bn' ? 'ডিজিটাল পাস কার্ড' : 'Digital pass card',
            ],
            actionLabel: language == 'bn' ? 'এখনই কিনুন' : 'Buy Now',
            onBuy: _purchasing ? null : () => _buyPass('monthly'),
          ),
          const SizedBox(height: AppSpacing.md),
          _PassCard(
            language: language,
            titleBn: 'ত্রৈমাসিক পাস',
            titleEn: 'Quarterly Pass',
            passType: 'quarterly',
            duration: language == 'bn' ? '৯০ দিন' : '90 days',
            gradient: const [Color(0xFF6D28D9), Color(0xFF4C1D95)],
            price: _priceOf('quarterly'),
            savings: language == 'bn' ? 'সবচেয়ে জনপ্রিয়' : 'Most Popular',
            featured: true,
            features: [
              language == 'bn' ? 'অতিরিক্ত ১০% ছাড়' : 'Extra 10% discount',
              language == 'bn' ? 'FastPass লেন অ্যাক্সেস' : 'FastPass lane access',
              language == 'bn' ? 'স্বয়ংক্রিয় পেমেন্ট' : 'Automatic payment',
            ],
            actionLabel: language == 'bn' ? 'এখনই কিনুন' : 'Buy Now',
            onBuy: _purchasing ? null : () => _buyPass('quarterly'),
          ),
          const SizedBox(height: AppSpacing.md),
          _PassCard(
            language: language,
            titleBn: 'বার্ষিক পাস',
            titleEn: 'Annual Pass',
            passType: 'annual',
            duration: language == 'bn' ? '৩৬৫ দিন' : '365 days',
            gradient: const [AppColors.primaryDark, Color(0xFF052E16)],
            price: _priceOf('annual'),
            savings: language == 'bn' ? 'সর্বোচ্চ সাশ্রয়' : 'Best value',
            features: [
              language == 'bn' ? 'অগ্রাধিকার গ্রাহক সেবা' : 'Priority support',
              language == 'bn' ? 'FastPass লেন অ্যাক্সেস' : 'FastPass lane access',
              language == 'bn' ? 'সব গেট কভারেজ' : 'All gates coverage',
            ],
            actionLabel: language == 'bn' ? 'এখনই কিনুন' : 'Buy Now',
            onBuy: _purchasing ? null : () => _buyPass('annual'),
          ),
          const SizedBox(height: AppSpacing.lg),
          OutlinedButton(
            onPressed: () => context.push('/passes/my'),
            child: Text(language == 'bn' ? 'আমার পাস দেখুন' : 'View My Passes'),
          ),
        ],
      ),
    );
  }
}

class _PassCard extends StatelessWidget {
  const _PassCard({
    required this.language,
    required this.titleBn,
    required this.titleEn,
    required this.passType,
    required this.duration,
    required this.gradient,
    required this.price,
    required this.savings,
    required this.features,
    required this.actionLabel,
    required this.onBuy,
    this.featured = false,
  });

  final String language;
  final String titleBn;
  final String titleEn;
  final String passType;
  final String duration;
  final List<Color> gradient;
  final int price;
  final String savings;
  final List<String> features;
  final String actionLabel;
  final VoidCallback? onBuy;
  final bool featured;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(
          color: featured ? AppColors.primary : AppColors.cardBorder,
          width: featured ? 2 : 1,
        ),
      ),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: gradient),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    language == 'bn' ? titleBn : titleEn,
                    style: AppTextStyles.h4.copyWith(color: Colors.white),
                  ),
                ),
                Text(
                  duration,
                  style: AppTextStyles.bodySmall.copyWith(color: Colors.white70),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  CurrencyFormatter.formatPaisa(price),
                  style: AppTextStyles.amountLarge,
                ),
                Text(savings, style: AppTextStyles.bodySmall),
                const SizedBox(height: AppSpacing.sm),
                ...features.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_rounded,
                            size: 16, color: AppColors.success),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(item, style: AppTextStyles.bodySmall),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: onBuy,
                    child: Text(actionLabel),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
