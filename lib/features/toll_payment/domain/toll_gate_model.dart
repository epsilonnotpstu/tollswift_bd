import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class TollGateModel {
  const TollGateModel({
    required this.id,
    required this.name,
    required this.nameEn,
    required this.roadName,
    required this.location,
    required this.address,
    required this.status,
    required this.tollRates,
  });

  final String id;
  final String name;
  final String nameEn;
  final String roadName;
  final LatLng location;
  final String address;
  final String status;
  final Map<String, int> tollRates;

  factory TollGateModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    return TollGateModel.fromMap(data, fallbackId: doc.id);
  }

  factory TollGateModel.fromMap(
    Map<String, dynamic> data, {
    String fallbackId = '',
  }) {
    final geopoint = data['location'] as GeoPoint?;
    final ratesRaw = (data['toll_rates'] as Map?)?.cast<String, dynamic>() ?? {};
    return TollGateModel(
      id: data['id'] as String? ?? fallbackId,
      name: data['name'] as String? ?? '',
      nameEn: data['name_en'] as String? ?? '',
      roadName: data['road_name'] as String? ?? '',
      location: LatLng(geopoint?.latitude ?? 23.8103, geopoint?.longitude ?? 90.4125),
      address: data['address'] as String? ?? '',
      status: data['status'] as String? ?? 'active',
      tollRates: ratesRaw.map(
        (key, value) => MapEntry(key, (value as num?)?.toInt() ?? 0),
      ),
    );
  }
}
