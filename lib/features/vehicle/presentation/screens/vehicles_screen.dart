import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/vehicle_model.dart';
import '../providers/vehicle_provider.dart';

class VehiclesScreen extends ConsumerWidget {
  const VehiclesScreen({super.key, this.showAppBar = false});

  final bool showAppBar;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final vehiclesAsync = ref.watch(vehiclesProvider);
    final title = language == 'bn' ? 'আমার গাড়ি' : 'My Vehicles';
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: showAppBar ? AppBar(title: Text(title)) : null,
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/vehicles/add'),
        backgroundColor: AppColors.accent,
        child: const Icon(Icons.add_rounded, color: Colors.white),
      ),
      body: SafeArea(
        child: vehiclesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(child: Text(error.toString())),
          data: (vehicles) {
            return RefreshIndicator(
              onRefresh: () async => ref.invalidate(vehiclesProvider),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.lg,
                  92,
                ),
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(title, style: AppTextStyles.h2),
                            Text(
                              language == 'bn'
                                  ? 'নিবন্ধিত: ${vehicles.length}টি গাড়ি'
                                  : 'Registered vehicles: ${vehicles.length}',
                              style: AppTextStyles.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      OutlinedButton.icon(
                        onPressed: () => context.push('/vehicles/add'),
                        icon: const Icon(Icons.add_rounded, size: 18),
                        label: Text(language == 'bn'
                            ? 'গাড়ি যোগ করুন'
                            : 'Add Vehicle'),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  if (vehicles.isEmpty) _EmptyVehicles(language: language),
                  ...vehicles.map(
                    (vehicle) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: _VehicleCard(vehicle: vehicle, language: language),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _VehicleCard extends ConsumerWidget {
  const _VehicleCard({required this.vehicle, required this.language});

  final VehicleModel vehicle;
  final String language;

  Color _typeColor(String type) {
    return switch (type) {
      'motorcycle' => AppColors.warning,
      'truck' => AppColors.info,
      'bus' => AppColors.accent,
      'cng' => const Color(0xFF0EA5A4),
      'microbus' => const Color(0xFF8B5CF6),
      _ => AppColors.primary,
    };
  }

  String _statusLabel() {
    if (language == 'bn') {
      return switch (vehicle.brtcStatus) {
        'api_verified' || 'verified' => 'যাচাইকৃত ✓',
        'pending_manual' => 'ম্যানুয়াল পর্যালোচনা',
        'pending' => 'অপেক্ষমান',
        _ => 'প্রত্যাখ্যাত',
      };
    }
    return switch (vehicle.brtcStatus) {
      'api_verified' || 'verified' => 'Verified ✓',
      'pending_manual' => 'Manual Review',
      'pending' => 'Pending',
      _ => 'Rejected',
    };
  }

  Color _statusColor() {
    return switch (vehicle.brtcStatus) {
      'api_verified' || 'verified' => AppColors.success,
      'pending' => AppColors.warning,
      'pending_manual' => const Color(0xFFF97316),
      _ => AppColors.error,
    };
  }

  IconData _vehicleIcon() {
    return switch (vehicle.vehicleType) {
      'motorcycle' => Icons.two_wheeler_rounded,
      'truck' => Icons.local_shipping_rounded,
      'bus' => Icons.directions_bus_filled_rounded,
      'microbus' => Icons.airport_shuttle_rounded,
      'cng' => Icons.electric_rickshaw_rounded,
      _ => Icons.directions_car_filled_rounded,
    };
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final typeColor = _typeColor(vehicle.vehicleType);
    final statusColor = _statusColor();
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(
          color: vehicle.isActive ? AppColors.primary : AppColors.cardBorder,
          width: vehicle.isActive ? 1.8 : 1.2,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x12000000),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: typeColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(_vehicleIcon(), color: typeColor),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _LicensePlate(plate: vehicle.plateNumber),
                      const SizedBox(height: 8),
                      Text(
                        vehicle.displayName,
                        style: AppTextStyles.bodyMedium
                            .copyWith(fontWeight: FontWeight.w700),
                      ),
                      if (vehicle.nickname.trim().isNotEmpty)
                        Text(
                          vehicle.nickname,
                          style: AppTextStyles.bodySmall,
                        ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        _statusLabel(),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    PopupMenuButton<String>(
                      icon: const Icon(Icons.more_vert_rounded),
                      onSelected: (value) async {
                        if (value == 'active') {
                          await ref
                              .read(vehicleActionsProvider)
                              .setActiveVehicle(vehicle.id);
                        } else if (value == 'delete') {
                          await ref
                              .read(vehicleActionsProvider)
                              .deleteVehicle(vehicle.id);
                        } else {
                          if (!context.mounted) return;
                          context.push('/vehicles/detail/${vehicle.id}');
                        }
                      },
                      itemBuilder: (context) => [
                        PopupMenuItem(
                          value: 'detail',
                          child: Text(
                            language == 'bn' ? 'বিস্তারিত' : 'Details',
                          ),
                        ),
                        PopupMenuItem(
                          value: 'active',
                          child: Text(
                            language == 'bn' ? 'সক্রিয় করুন' : 'Set Active',
                          ),
                        ),
                        PopupMenuItem(
                          value: 'delete',
                          child: Text(
                            language == 'bn' ? 'মুছুন' : 'Delete',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (vehicle.isActive)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 9),
              decoration: const BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(AppRadius.lg),
                ),
              ),
              child: Text(
                language == 'bn'
                    ? '● সক্রিয় গাড়ি — টোল পেমেন্টে ব্যবহৃত হবে'
                    : '● Active vehicle - used for toll payment',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodySmall.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _LicensePlate extends StatelessWidget {
  const _LicensePlate({required this.plate});

  final String plate;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF5C518),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border:
            Border.all(color: Colors.black.withValues(alpha: 0.7), width: 1.4),
      ),
      child: Text(
        plate,
        style: const TextStyle(
          fontFamily: 'RobotoMono',
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Color(0xFF111827),
        ),
      ),
    );
  }
}

class _EmptyVehicles extends StatelessWidget {
  const _EmptyVehicles({required this.language});

  final String language;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          Container(
            width: 84,
            height: 84,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.directions_car_filled_rounded,
              color: AppColors.primary,
              size: 42,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            language == 'bn' ? 'এখনো কোনো গাড়ি নেই' : 'No vehicles yet',
            style: AppTextStyles.h4,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            language == 'bn'
                ? 'আপনার গাড়ি যোগ করুন এবং ডিজিটাল টোল পেমেন্ট শুরু করুন'
                : 'Add a vehicle to start digital toll payment',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: AppSpacing.md),
          FilledButton.icon(
            onPressed: () => context.push('/vehicles/add'),
            icon: const Icon(Icons.add_rounded),
            label: Text(language == 'bn' ? 'গাড়ি যোগ করুন' : 'Add Vehicle'),
          ),
        ],
      ),
    );
  }
}
