import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../pass/presentation/providers/pass_provider.dart';
import '../../../vehicle/domain/vehicle_model.dart';
import '../../../vehicle/presentation/providers/vehicle_provider.dart';
import '../../../wallet/presentation/providers/wallet_provider.dart';
import '../../domain/toll_gate_model.dart';
import '../providers/toll_provider.dart';

class PaymentConfirmScreen extends ConsumerStatefulWidget {
  const PaymentConfirmScreen({super.key});

  @override
  ConsumerState<PaymentConfirmScreen> createState() =>
      _PaymentConfirmScreenState();
}

class _PaymentConfirmScreenState extends ConsumerState<PaymentConfirmScreen> {
  bool _paying = false;

  int _resolveTollAmount(TollGateModel gate, VehicleModel vehicle) {
    final map = gate.tollRates;
    final type = vehicle.vehicleType;
    if (map.containsKey(type)) return map[type] ?? 0;
    if (type == 'truck') return map['truck_small'] ?? map['truck_large'] ?? 0;
    if (type == 'bus') return map['bus_small'] ?? map['bus_large'] ?? 0;
    return map['car'] ?? 0;
  }

  Future<void> _pay({
    required String language,
    required bool needBiometric,
    required bool insufficient,
  }) async {
    if (insufficient) {
      context.push('/wallet/add');
      return;
    }
    if (_paying) return;
    setState(() => _paying = true);
    try {
      if (needBiometric) {
        final localAuth = LocalAuthentication();
        final ok = await localAuth.authenticate(
          localizedReason: 'Confirm toll payment in TollBD',
          options: const AuthenticationOptions(
            biometricOnly: true,
            stickyAuth: true,
          ),
        );
        if (!ok) {
          if (mounted) setState(() => _paying = false);
          return;
        }
      }

      final result = await ref.read(tollActionsProvider).processPayment();
      if (!mounted) return;
      if (result.success) {
        context.go('/pay/success?paymentId=${result.paymentId}');
      } else {
        context.go('/pay/failed?paymentId=${result.paymentId}');
      }
    } catch (error) {
      if (!mounted) return;
      setState(() => _paying = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final gate = ref.watch(verifiedGateProvider);
    final vehicles = ref.watch(vehiclesProvider).valueOrNull ?? const [];
    final selectedVehicleId = ref.watch(selectedVehicleIdProvider);
    final vehicle =
        vehicles.where((v) => v.id == selectedVehicleId).toList().firstOrNull ??
            ref.watch(activeVehicleProvider);
    final passes = ref.watch(activePassesProvider);
    final balance = ref.watch(walletBalanceProvider).valueOrNull ?? 0;

    if (gate == null || vehicle == null) {
      return Scaffold(
        appBar: AppBar(
            title: Text(
                language == 'bn' ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment')),
        body: Center(
          child: FilledButton(
            onPressed: () => context.go('/pay'),
            child: Text(language == 'bn' ? 'আবার স্ক্যান করুন' : 'Scan again'),
          ),
        ),
      );
    }

    final activePass =
        passes.where((p) => p.vehicleId == vehicle.id).toList().firstOrNull;
    final tollAmount =
        activePass != null ? 0 : _resolveTollAmount(gate, vehicle);
    final shortfall = tollAmount - balance;
    final insufficient = shortfall > 0;
    final balanceAfter = balance - tollAmount;
    final needBiometric =
        ref.watch(currentUserProfileProvider).valueOrNull?.biometricEnabled ??
            false;
    final queueAsync = ref.watch(gateQueueProvider(gate.id));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title:
            Text(language == 'bn' ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.route_rounded, color: AppColors.primary),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        language == 'bn' ? gate.name : gate.nameEn,
                        style: AppTextStyles.h3,
                      ),
                    ),
                  ],
                ),
                Text(gate.roadName, style: AppTextStyles.bodySmall),
                const SizedBox(height: AppSpacing.sm),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    '📍 ${gate.address.isEmpty ? gate.roadName : gate.address}',
                    style: AppTextStyles.bodySmall,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(language == 'bn' ? 'গাড়ি' : 'Vehicle',
                          style: AppTextStyles.bodySmall),
                      const SizedBox(height: 5),
                      Text(vehicle.plateNumber,
                          style: AppTextStyles.bodyMedium.copyWith(
                            fontWeight: FontWeight.w700,
                          )),
                      Text(
                        '${vehicle.displayName} (${vehicle.vehicleType})',
                        style: AppTextStyles.bodySmall,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(language == 'bn' ? 'পরিমাণ' : 'Amount',
                          style: AppTextStyles.bodySmall),
                      Text(
                        CurrencyFormatter.formatPaisa(tollAmount),
                        style: AppTextStyles.amountLarge.copyWith(
                          color: AppColors.primary,
                          fontSize: 28,
                        ),
                      ),
                      Text(
                        '${language == 'bn' ? 'বর্তমান ব্যালেন্স' : 'Current balance'}: ${CurrencyFormatter.formatPaisa(balance)}',
                        style: AppTextStyles.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          if (activePass != null)
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.successBg,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Text(
                language == 'bn'
                    ? '✓ মাসিক পাস সক্রিয় — এই টোল বিনামূল্যে!'
                    : '✓ Active pass found - this toll is free!',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.success,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Expanded(
                child: Text(
                  language == 'bn'
                      ? 'পেমেন্টের পরে ব্যালেন্স:'
                      : 'Balance after payment:',
                  style: AppTextStyles.bodySmall,
                ),
              ),
              Text(
                CurrencyFormatter.formatPaisa(balanceAfter),
                style: AppTextStyles.amountSmall,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          queueAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (queue) {
              if (queue == null) return const SizedBox.shrink();
              final estimatedWait = queue.averageWaitMinutes;
              return Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.infoBg,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      language == 'bn'
                          ? '${gate.name} গেটে এখন ${queue.queueCount}টি গাড়ি অপেক্ষায়'
                          : '${queue.queueCount} vehicles waiting at ${gate.nameEn}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.info,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      language == 'bn'
                          ? 'আপনার আনুমানিক অপেক্ষা: $estimatedWait মিনিট'
                          : 'Estimated wait: $estimatedWait minutes',
                      style: AppTextStyles.bodySmall,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => context.push('/pay/nearby-gates'),
                            child: Text(
                              language == 'bn'
                                  ? 'অন্য গেট বেছে নিন'
                                  : 'Choose another gate',
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: FilledButton.tonal(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    language == 'bn'
                                        ? 'বর্তমান গেটেই পেমেন্ট চালিয়ে যাবে'
                                        : 'Continuing payment on current gate',
                                  ),
                                ),
                              );
                            },
                            child: Text(
                              language == 'bn'
                                  ? 'তবুও পেমেন্ট করুন'
                                  : 'Pay anyway',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: AppSpacing.sm),
          if (insufficient)
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.errorBg,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    language == 'bn'
                        ? '❌ অপর্যাপ্ত ব্যালেন্স — ${CurrencyFormatter.formatPaisa(shortfall)} কম আছে'
                        : '❌ Insufficient balance — short by ${CurrencyFormatter.formatPaisa(shortfall)}',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.error),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  TextButton(
                    onPressed: () => context.push('/wallet/add'),
                    child:
                        Text(language == 'bn' ? 'টাকা যোগ করুন' : 'Add money'),
                  ),
                ],
              ),
            ),
          const SizedBox(height: AppSpacing.xl),
          SizedBox(
            height: 56,
            child: FilledButton(
              onPressed: _paying
                  ? null
                  : () => _pay(
                        language: language,
                        needBiometric: needBiometric,
                        insufficient: insufficient,
                      ),
              style: FilledButton.styleFrom(backgroundColor: AppColors.accent),
              child: _paying
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(language == 'bn' ? 'পরিশোধ করুন' : 'Pay now'),
            ),
          ),
          TextButton(
            onPressed: () => context.pop(),
            child: Text(language == 'bn' ? 'বাতিল করুন' : 'Cancel'),
          ),
          Center(
            child: Text(
              language == 'bn'
                  ? 'পেমেন্ট নিরাপদ ও এনক্রিপ্টেড 🔒'
                  : 'Secure and encrypted payment 🔒',
              style: AppTextStyles.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}

extension _FirstOrNullExt<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
