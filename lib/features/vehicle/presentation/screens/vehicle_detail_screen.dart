import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../domain/vehicle_model.dart';
import '../providers/vehicle_provider.dart';

class VehicleDetailScreen extends ConsumerWidget {
  const VehicleDetailScreen({super.key, required this.vehicleId});

  final String vehicleId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vehicles = ref.watch(vehiclesProvider).valueOrNull ?? const [];
    VehicleModel? vehicle;
    for (final item in vehicles) {
      if (item.id == vehicleId) {
        vehicle = item;
        break;
      }
    }
    return Scaffold(
      appBar: AppBar(title: const Text('Vehicle Details')),
      body: vehicle == null
          ? const Center(child: Text('Vehicle not found'))
          : ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                Text(vehicle.plateNumber, style: AppTextStyles.h2),
                const SizedBox(height: AppSpacing.md),
                _Item(label: 'Type', value: vehicle.vehicleType),
                _Item(label: 'Make / Model', value: '${vehicle.make} ${vehicle.model}'),
                _Item(label: 'Year', value: vehicle.year.toString()),
                _Item(label: 'Color', value: vehicle.color),
                _Item(label: 'Nickname', value: vehicle.nickname),
                _Item(label: 'BRTC Status', value: vehicle.brtcStatus),
              ],
            ),
    );
  }
}

class _Item extends StatelessWidget {
  const _Item({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        children: [
          Expanded(child: Text(label, style: AppTextStyles.bodySmall)),
          Expanded(
            child: Text(
              value.isEmpty ? '-' : value,
              style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}
