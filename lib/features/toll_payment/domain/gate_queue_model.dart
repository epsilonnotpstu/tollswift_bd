import 'package:cloud_firestore/cloud_firestore.dart';

class QueueVehicle {
  const QueueVehicle({
    required this.vehicleId,
    required this.plateNumber,
    required this.vehicleType,
    required this.userId,
    required this.enteredAt,
    required this.estimatedWait,
    required this.position,
  });

  final String vehicleId;
  final String plateNumber;
  final String vehicleType;
  final String userId;
  final DateTime? enteredAt;
  final int estimatedWait;
  final int position;

  factory QueueVehicle.fromMap(Map<String, dynamic> map) {
    return QueueVehicle(
      vehicleId: map['vehicleId'] as String? ?? '',
      plateNumber: map['plateNumber'] as String? ?? '',
      vehicleType: map['vehicleType'] as String? ?? '',
      userId: map['userId'] as String? ?? '',
      enteredAt: (map['enteredAt'] as Timestamp?)?.toDate(),
      estimatedWait: (map['estimatedWait'] as num?)?.toInt() ?? 0,
      position: (map['position'] as num?)?.toInt() ?? 0,
    );
  }
}

class GateQueueModel {
  const GateQueueModel({
    required this.gateId,
    required this.vehicles,
    required this.updatedAt,
  });

  final String gateId;
  final List<QueueVehicle> vehicles;
  final DateTime? updatedAt;

  int get queueCount => vehicles.length;

  int get averageWaitMinutes {
    if (vehicles.isEmpty) return 0;
    final total =
        vehicles.fold<int>(0, (accumulator, item) => accumulator + item.estimatedWait);
    return (total / vehicles.length).round();
  }

  factory GateQueueModel.fromFirestore(
    String gateId,
    Map<String, dynamic> data,
  ) {
    final rawVehicles = (data['vehicles'] as List?)?.cast<dynamic>() ?? const [];
    return GateQueueModel(
      gateId: gateId,
      vehicles: rawVehicles
          .map((item) => QueueVehicle.fromMap((item as Map).cast<String, dynamic>()))
          .toList()
        ..sort((a, b) => a.position.compareTo(b.position)),
      updatedAt: (data['updated_at'] as Timestamp?)?.toDate(),
    );
  }
}
