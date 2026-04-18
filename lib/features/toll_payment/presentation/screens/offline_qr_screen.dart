import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../vehicle/presentation/providers/vehicle_provider.dart';
import '../providers/toll_provider.dart';

class OfflineQrScreen extends ConsumerStatefulWidget {
  const OfflineQrScreen({super.key});

  @override
  ConsumerState<OfflineQrScreen> createState() => _OfflineQrScreenState();
}

class _OfflineQrScreenState extends ConsumerState<OfflineQrScreen> {
  int _reserveAmount = 50000;
  bool _generating = false;

  Future<void> _generate() async {
    final language = ref.read(languageProvider);
    final vehicleId = ref.read(selectedVehicleIdProvider);
    if (vehicleId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(
                language == 'bn' ? 'গাড়ি নির্বাচন করুন' : 'Select a vehicle')),
      );
      return;
    }
    setState(() => _generating = true);
    try {
      await ref.read(tollActionsProvider).generateOfflineToken(
            vehicleId: vehicleId,
            reservedAmount: _reserveAmount,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(language == 'bn'
                ? 'অফলাইন QR তৈরি হয়েছে'
                : 'Offline QR generated')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final tokensAsync = ref.watch(offlineQrTokensProvider);
    final vehicles = ref.watch(vehiclesProvider).valueOrNull ?? const [];
    final selected = ref.watch(selectedVehicleIdProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(language == 'bn' ? 'অফলাইন QR মোড' : 'Offline QR Mode'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          DropdownButtonFormField<String>(
            value: selected,
            decoration: InputDecoration(
              labelText: language == 'bn' ? 'গাড়ি নির্বাচন' : 'Select vehicle',
            ),
            items: vehicles
                .map(
                  (vehicle) => DropdownMenuItem(
                    value: vehicle.id,
                    child: Text(vehicle.plateNumber),
                  ),
                )
                .toList(),
            onChanged: (value) =>
                ref.read(selectedVehicleIdProvider.notifier).state = value,
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            language == 'bn' ? 'রিজার্ভ ব্যালেন্স' : 'Reserved amount',
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: AppSpacing.xs),
          Wrap(
            spacing: AppSpacing.sm,
            children: [30000, 50000, 70000, 100000]
                .map(
                  (amount) => ChoiceChip(
                    selected: _reserveAmount == amount,
                    onSelected: (_) => setState(() => _reserveAmount = amount),
                    label: Text(CurrencyFormatter.formatPaisa(amount)),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: AppSpacing.md),
          FilledButton.icon(
            onPressed: _generating ? null : _generate,
            icon: const Icon(Icons.qr_code_rounded),
            label: Text(
              language == 'bn' ? 'অফলাইন QR তৈরি করুন' : 'Generate Offline QR',
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            language == 'bn' ? 'বর্তমান টোকেন' : 'Current tokens',
            style: AppTextStyles.h4,
          ),
          const SizedBox(height: AppSpacing.sm),
          ...tokensAsync.when(
            loading: () => [const Center(child: CircularProgressIndicator())],
            error: (error, _) => [Text(error.toString())],
            data: (tokens) {
              if (tokens.isEmpty) {
                return [
                  Text(
                    language == 'bn' ? 'কোনো টোকেন নেই' : 'No tokens yet',
                    style: AppTextStyles.bodySmall,
                  ),
                ];
              }
              return tokens.map(
                (token) => Container(
                  margin: const EdgeInsets.only(bottom: AppSpacing.md),
                  padding: const EdgeInsets.all(AppSpacing.md),
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
                          Expanded(
                            child: Text(
                              '${language == 'bn' ? 'মেয়াদ' : 'Expires'}: ${token.validUntil}',
                              style: AppTextStyles.bodySmall,
                            ),
                          ),
                          Text(
                            token.status,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: token.status == 'unused'
                                  ? AppColors.success
                                  : AppColors.textHint,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Center(
                        child: QrImageView(
                          data: token.tokenHash,
                          size: 170,
                          foregroundColor: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        '${language == 'bn' ? 'রিজার্ভ' : 'Reserved'}: ${CurrencyFormatter.formatPaisa(token.amountReserved)}',
                        style: AppTextStyles.bodySmall,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
