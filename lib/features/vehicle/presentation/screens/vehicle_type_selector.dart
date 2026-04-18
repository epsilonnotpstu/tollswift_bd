import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';

class VehicleTypeOption {
  const VehicleTypeOption({
    required this.key,
    required this.labelBn,
    required this.labelEn,
    required this.icon,
    required this.color,
  });

  final String key;
  final String labelBn;
  final String labelEn;
  final IconData icon;
  final Color color;
}

const vehicleTypeOptions = [
  VehicleTypeOption(
    key: 'motorcycle',
    labelBn: 'মোটরসাইকেল',
    labelEn: 'Motorcycle',
    icon: Icons.two_wheeler_rounded,
    color: AppColors.warning,
  ),
  VehicleTypeOption(
    key: 'car',
    labelBn: 'গাড়ি',
    labelEn: 'Car',
    icon: Icons.directions_car_filled_rounded,
    color: AppColors.primary,
  ),
  VehicleTypeOption(
    key: 'microbus',
    labelBn: 'মাইক্রোবাস',
    labelEn: 'Microbus',
    icon: Icons.airport_shuttle_rounded,
    color: AppColors.info,
  ),
  VehicleTypeOption(
    key: 'truck',
    labelBn: 'ট্রাক',
    labelEn: 'Truck',
    icon: Icons.local_shipping_rounded,
    color: Color(0xFF2563EB),
  ),
  VehicleTypeOption(
    key: 'bus',
    labelBn: 'বাস',
    labelEn: 'Bus',
    icon: Icons.directions_bus_filled_rounded,
    color: AppColors.accent,
  ),
  VehicleTypeOption(
    key: 'cng',
    labelBn: 'সিএনজি',
    labelEn: 'CNG',
    icon: Icons.electric_rickshaw_rounded,
    color: Color(0xFF0EA5A4),
  ),
];

class VehicleTypeSelector extends StatelessWidget {
  const VehicleTypeSelector({
    super.key,
    required this.language,
    required this.selectedType,
    required this.onChanged,
  });

  final String language;
  final String selectedType;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 102,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemBuilder: (context, index) {
          final item = vehicleTypeOptions[index];
          final selected = selectedType == item.key;
          return InkWell(
            onTap: () => onChanged(item.key),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            child: Container(
              width: 84,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: selected ? item.color.withValues(alpha: 0.12) : Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(
                  color: selected ? item.color : AppColors.cardBorder,
                  width: selected ? 2 : 1.2,
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: item.color.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(item.icon, color: item.color),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    language == 'bn' ? item.labelBn : item.labelEn,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: selected ? item.color : AppColors.textSecondary,
                      fontWeight: FontWeight.w700,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        },
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
        itemCount: vehicleTypeOptions.length,
      ),
    );
  }
}
