import 'package:cloud_firestore/cloud_firestore.dart';

class PassModel {
  const PassModel({
    required this.id,
    required this.userId,
    required this.vehicleId,
    required this.passType,
    required this.vehicleType,
    required this.price,
    required this.status,
    required this.validFrom,
    required this.validUntil,
    required this.autoRenew,
    required this.coveredGates,
    this.transactionId,
    required this.createdAt,
  });

  final String id;
  final String userId;
  final String vehicleId;
  final String passType;
  final String vehicleType;
  final int price;
  final String status;
  final DateTime validFrom;
  final DateTime validUntil;
  final bool autoRenew;
  final List<String> coveredGates;
  final String? transactionId;
  final DateTime createdAt;

  bool get isActive => status == 'active' && validUntil.isAfter(DateTime.now());

  int get daysLeft => validUntil.difference(DateTime.now()).inDays;

  factory PassModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    final rawGates =
        (data['covered_gates'] as List?)?.cast<dynamic>() ?? const [];
    return PassModel(
      id: data['id'] as String? ?? doc.id,
      userId: data['user_id'] as String? ?? '',
      vehicleId: data['vehicle_id'] as String? ?? '',
      passType: data['pass_type'] as String? ?? 'monthly',
      vehicleType: data['vehicle_type'] as String? ?? 'car',
      price: (data['price'] as num?)?.toInt() ?? 0,
      status: data['status'] as String? ?? 'expired',
      validFrom: (data['valid_from'] as Timestamp?)?.toDate() ?? DateTime.now(),
      validUntil:
          (data['valid_until'] as Timestamp?)?.toDate() ?? DateTime.now(),
      autoRenew: data['auto_renew'] as bool? ?? false,
      coveredGates: rawGates.map((item) => item.toString()).toList(),
      transactionId: data['transaction_id'] as String?,
      createdAt: (data['created_at'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}
