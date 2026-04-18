import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../history/domain/trip_model.dart';
import '../../toll_payment/domain/toll_payment_model.dart';

class HistoryRepository {
  HistoryRepository({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
    Dio? dio,
    this.cloudFunctionsBaseUrl =
        'https://us-central1-tollbd-production.cloudfunctions.net',
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance,
        _dio = dio ?? Dio();

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;
  final Dio _dio;
  final String cloudFunctionsBaseUrl;

  String? get _uid => _auth.currentUser?.uid;

  Stream<List<TripModel>> tripsStream() {
    final uid = _uid;
    if (uid == null) return Stream.value(const []);

    final controller = StreamController<List<TripModel>>();
    List<TripModel> tollTrips = const [];
    List<TripModel> passTrips = const [];

    void emit() {
      final merged = [...tollTrips, ...passTrips]
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      controller.add(merged);
    }

    final tollSub = _firestore
        .collection('toll_payments')
        .where('user_id', isEqualTo: uid)
        .orderBy('created_at', descending: true)
        .snapshots()
        .listen((snapshot) {
      tollTrips = snapshot.docs.map((doc) {
        final payment = TollPaymentModel.fromFirestore(doc);
        return TripModel(
          id: payment.id,
          type: 'toll',
          title: payment.gateName,
          subtitle: payment.roadName,
          amount: -payment.amount,
          status: payment.status,
          createdAt: payment.createdAt,
          vehicleId: payment.vehicleId,
          vehiclePlate: payment.vehiclePlate,
          gateId: payment.gateId,
          paymentId: payment.id,
        );
      }).toList();
      emit();
    });

    final passSub = _firestore
        .collection('transactions')
        .where('user_id', isEqualTo: uid)
        .where('type', isEqualTo: 'pass_purchase')
        .orderBy('created_at', descending: true)
        .snapshots()
        .listen((snapshot) {
      passTrips = snapshot.docs.map((doc) {
        final data = doc.data();
        final createdAt =
            (data['created_at'] as Timestamp?)?.toDate() ?? DateTime.now();
        return TripModel(
          id: data['id'] as String? ?? doc.id,
          type: 'pass',
          title: (data['description_bn'] as String?) ??
              (data['description'] as String?) ??
              'Pass purchase',
          subtitle: (data['description'] as String?) ?? 'Pass purchase',
          amount: -((data['amount'] as num?)?.toInt() ?? 0),
          status: data['status'] as String? ?? 'success',
          createdAt: createdAt,
          paymentId: data['reference_id'] as String?,
        );
      }).toList();
      emit();
    });

    controller.onCancel = () async {
      await tollSub.cancel();
      await passSub.cancel();
    };
    return controller.stream;
  }

  Stream<TollPaymentModel?> tollPaymentById(String paymentId) {
    return _firestore
        .collection('toll_payments')
        .doc(paymentId)
        .snapshots()
        .map((doc) => doc.exists ? TollPaymentModel.fromFirestore(doc) : null);
  }

  Future<Map<String, dynamic>> submitDispute({
    required String tollPaymentId,
    required String reason,
    required String description,
    required List<String> evidenceUrls,
  }) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/createDispute',
      data: {
        'data': {
          'tollPaymentId': tollPaymentId,
          'reason': reason,
          'description': description,
          'evidenceUrls': evidenceUrls,
        },
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    return result;
  }
}
