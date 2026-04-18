import 'package:cloud_firestore/cloud_firestore.dart';

class VehicleModel {
  const VehicleModel({
    required this.id,
    required this.ownerUid,
    required this.plateNumber,
    required this.plateNumberRaw,
    required this.vehicleType,
    required this.make,
    required this.model,
    required this.color,
    required this.year,
    this.registrationDocUrl,
    required this.brtcStatus,
    this.brtcData,
    required this.isActive,
    required this.nickname,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String ownerUid;
  final String plateNumber;
  final String plateNumberRaw;
  final String vehicleType;
  final String make;
  final String model;
  final String color;
  final int year;
  final String? registrationDocUrl;
  final String brtcStatus;
  final Map<String, dynamic>? brtcData;
  final bool isActive;
  final String nickname;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory VehicleModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    return VehicleModel(
      id: data['id'] as String? ?? doc.id,
      ownerUid: data['owner_uid'] as String? ?? '',
      plateNumber: data['plate_number'] as String? ?? '',
      plateNumberRaw: data['plate_number_raw'] as String? ?? '',
      vehicleType: data['vehicle_type'] as String? ?? 'car',
      make: data['make'] as String? ?? '',
      model: data['model'] as String? ?? '',
      color: data['color'] as String? ?? 'White',
      year: (data['year'] as num?)?.toInt() ?? DateTime.now().year,
      registrationDocUrl: data['registration_doc_url'] as String?,
      brtcStatus: data['brtc_status'] as String? ?? 'pending_manual',
      brtcData: (data['brtc_data'] as Map?)?.cast<String, dynamic>(),
      isActive: data['is_active'] as bool? ?? false,
      nickname: data['nickname'] as String? ?? '',
      createdAt: (data['created_at'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updated_at'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'owner_uid': ownerUid,
      'plate_number': plateNumber,
      'plate_number_raw': plateNumberRaw,
      'vehicle_type': vehicleType,
      'make': make,
      'model': model,
      'color': color,
      'year': year,
      'registration_doc_url': registrationDocUrl,
      'brtc_status': brtcStatus,
      'brtc_data': brtcData,
      'is_active': isActive,
      'nickname': nickname,
      'created_at': Timestamp.fromDate(createdAt),
      'updated_at': Timestamp.fromDate(updatedAt),
    };
  }

  String get displayName {
    final brand = [make, model].where((item) => item.trim().isNotEmpty).join(' ');
    if (brand.isEmpty) return year.toString();
    return '$brand $year';
  }
}
