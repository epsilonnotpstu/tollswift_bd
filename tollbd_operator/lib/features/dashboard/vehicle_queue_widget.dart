import 'package:flutter/material.dart';

class VehicleQueueWidget extends StatelessWidget {
  const VehicleQueueWidget({
    super.key,
    required this.vehicles,
  });

  final List<Map<String, dynamic>> vehicles;

  @override
  Widget build(BuildContext context) {
    if (vehicles.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: const Text('No vehicles in queue'),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: vehicles.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final item = vehicles[index];
          final plate = item['plateNumber']?.toString() ?? '-';
          final vehicleType = item['vehicleType']?.toString() ?? 'car';
          final wait = (item['estimatedWait'] as num?)?.toInt() ?? 0;
          final position = (item['position'] as num?)?.toInt() ?? index + 1;

          return ListTile(
            dense: true,
            leading: CircleAvatar(
              radius: 16,
              child: Text(position.toString()),
            ),
            title: Text(plate, style: const TextStyle(fontWeight: FontWeight.w700)),
            subtitle: Text('$vehicleType • ETA ${wait}m'),
          );
        },
      ),
    );
  }
}
