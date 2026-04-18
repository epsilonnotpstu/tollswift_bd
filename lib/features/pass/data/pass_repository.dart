import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../domain/pass_model.dart';

class PurchasePassResponse {
  const PurchasePassResponse({
    required this.success,
    required this.passId,
    required this.price,
    required this.balanceAfter,
  });

  final bool success;
  final String passId;
  final int price;
  final int balanceAfter;
}

class PassRepository {
  PassRepository({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
    Dio? dio,
    this.cloudFunctionsBaseUrl =
        'https://us-central1-tollbd-production.cloudfunctions.net',
  }) : _firestore = firestore ?? FirebaseFirestore.instance,
       _auth = auth ?? FirebaseAuth.instance,
       _dio = dio ?? Dio();

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;
  final Dio _dio;
  final String cloudFunctionsBaseUrl;

  String? get _uid => _auth.currentUser?.uid;

  Stream<List<PassModel>> passesStream() {
    final uid = _uid;
    if (uid == null) return Stream.value(const []);
    return _firestore
        .collection('passes')
        .where('user_id', isEqualTo: uid)
        .orderBy('valid_until', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs.map(PassModel.fromFirestore).toList());
  }

  Future<PurchasePassResponse> purchasePass({
    required String vehicleId,
    required String vehicleType,
    required String passType,
  }) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/purchasePass',
      data: {
        'data': {
          'vehicleId': vehicleId,
          'vehicleType': vehicleType,
          'passType': passType,
        },
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    return PurchasePassResponse(
      success: result['success'] == true,
      passId: result['passId'] as String? ?? '',
      price: (result['price'] as num?)?.toInt() ?? 0,
      balanceAfter: (result['balanceAfter'] as num?)?.toInt() ?? 0,
    );
  }
}
