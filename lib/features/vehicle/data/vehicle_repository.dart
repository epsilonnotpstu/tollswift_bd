import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';

import '../../vehicle/domain/vehicle_model.dart';

class VehicleRepository {
  VehicleRepository({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
    FirebaseStorage? storage,
    Dio? dio,
    this.cloudFunctionsBaseUrl =
        'https://us-central1-tollbd-production.cloudfunctions.net',
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance,
        _storage = storage ?? FirebaseStorage.instance,
        _dio = dio ?? Dio();

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;
  final FirebaseStorage _storage;
  final Dio _dio;
  final String cloudFunctionsBaseUrl;

  String? get _uid => _auth.currentUser?.uid;

  Stream<List<VehicleModel>> vehiclesStream() {
    final uid = _uid;
    if (uid == null) return Stream.value(const []);
    return _firestore
        .collection('vehicles')
        .where('owner_uid', isEqualTo: uid)
        .orderBy('created_at', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map(VehicleModel.fromFirestore).toList());
  }

  Future<String> addVehicle({
    required String plateNumber,
    required String vehicleType,
    required String make,
    required String model,
    required String color,
    required int year,
    required String nickname,
    required bool brtcVerified,
    Map<String, dynamic>? brtcData,
    File? registrationFile,
  }) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/addVehicle',
      data: {
        'data': {
          'plateNumber': plateNumber,
          'vehicleType': vehicleType,
          'make': make,
          'model': model,
          'color': color,
          'year': year,
          'nickname': nickname,
          'brtcVerified': brtcVerified,
          'brtcData': brtcData,
        },
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    final vehicleId = result['vehicleId'] as String?;
    if (vehicleId == null) {
      throw Exception('Failed to create vehicle');
    }

    if (registrationFile != null) {
      final ext = registrationFile.path.split('.').last.toLowerCase();
      final ref = _storage.ref().child('vehicles/$vehicleId/registration.$ext');
      await ref.putFile(registrationFile);
      final url = await ref.getDownloadURL();
      await _firestore.collection('vehicles').doc(vehicleId).set({
        'registration_doc_url': url,
        'updated_at': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    }

    return vehicleId;
  }

  Future<void> setActiveVehicle(String vehicleId) async {
    final uid = _uid;
    if (uid == null) throw Exception('Not authenticated');
    final query = await _firestore
        .collection('vehicles')
        .where('owner_uid', isEqualTo: uid)
        .get();
    final batch = _firestore.batch();
    for (final doc in query.docs) {
      batch.update(doc.reference, {
        'is_active': doc.id == vehicleId,
        'updated_at': FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }

  Future<void> deleteVehicle(String vehicleId) async {
    await _firestore.collection('vehicles').doc(vehicleId).delete();
  }

  Future<VehicleModel?> getVehicle(String vehicleId) async {
    final doc = await _firestore.collection('vehicles').doc(vehicleId).get();
    if (!doc.exists) return null;
    return VehicleModel.fromFirestore(doc);
  }
}
