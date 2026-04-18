import 'package:cloud_firestore/cloud_firestore.dart';

class TollPaymentModel {
  const TollPaymentModel({
    required this.id,
    required this.userId,
    required this.vehicleId,
    required this.gateId,
    required this.gateName,
    required this.roadName,
    required this.vehiclePlate,
    required this.vehicleType,
    required this.amount,
    required this.status,
    required this.paymentMethod,
    required this.balanceBefore,
    required this.balanceAfter,
    required this.qrPayload,
    this.gateOperatorUid,
    this.disputeId,
    this.receiptUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String userId;
  final String vehicleId;
  final String gateId;
  final String gateName;
  final String roadName;
  final String vehiclePlate;
  final String vehicleType;
  final int amount;
  final String status;
  final String paymentMethod;
  final int balanceBefore;
  final int balanceAfter;
  final String qrPayload;
  final String? gateOperatorUid;
  final String? disputeId;
  final String? receiptUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory TollPaymentModel.fromFirestore(
    DocumentSnapshot<Map<String, dynamic>> doc,
  ) {
    final data = doc.data() ?? {};
    return TollPaymentModel(
      id: data['id'] as String? ?? doc.id,
      userId: data['user_id'] as String? ?? '',
      vehicleId: data['vehicle_id'] as String? ?? '',
      gateId: data['gate_id'] as String? ?? '',
      gateName: data['gate_name'] as String? ?? '',
      roadName: data['road_name'] as String? ?? '',
      vehiclePlate: data['vehicle_plate'] as String? ?? '',
      vehicleType: data['vehicle_type'] as String? ?? '',
      amount: (data['amount'] as num?)?.toInt() ?? 0,
      status: data['status'] as String? ?? 'failed',
      paymentMethod: data['payment_method'] as String? ?? 'wallet',
      balanceBefore: (data['balance_before'] as num?)?.toInt() ?? 0,
      balanceAfter: (data['balance_after'] as num?)?.toInt() ?? 0,
      qrPayload: data['qr_payload'] as String? ?? '',
      gateOperatorUid: data['gate_operator_uid'] as String?,
      disputeId: data['dispute_id'] as String?,
      receiptUrl: data['receipt_url'] as String?,
      createdAt: (data['created_at'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updated_at'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}

class OfflineQRToken {
  const OfflineQRToken({
    required this.id,
    required this.userId,
    required this.vehicleId,
    required this.tokenHash,
    required this.amountReserved,
    required this.validUntil,
    required this.status,
    this.usedAt,
    required this.createdAt,
  });

  final String id;
  final String userId;
  final String vehicleId;
  final String tokenHash;
  final int amountReserved;
  final DateTime validUntil;
  final String status;
  final DateTime? usedAt;
  final DateTime createdAt;

  factory OfflineQRToken.fromJson(Map<String, dynamic> json) {
    return OfflineQRToken(
      id: json['id'] as String? ?? '',
      userId: json['user_id'] as String? ?? '',
      vehicleId: json['vehicle_id'] as String? ?? '',
      tokenHash: json['token_hash'] as String? ?? '',
      amountReserved: (json['amount_reserved'] as num?)?.toInt() ?? 0,
      validUntil: DateTime.tryParse(json['valid_until'] as String? ?? '') ??
          DateTime.now().add(const Duration(hours: 24)),
      status: json['status'] as String? ?? 'unused',
      usedAt: DateTime.tryParse(json['used_at'] as String? ?? ''),
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'vehicle_id': vehicleId,
      'token_hash': tokenHash,
      'amount_reserved': amountReserved,
      'valid_until': validUntil.toIso8601String(),
      'status': status,
      'used_at': usedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}
