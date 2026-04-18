import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../domain/toll_gate_model.dart';
import '../domain/toll_payment_model.dart';

class VerifyGateResponse {
  const VerifyGateResponse({
    required this.valid,
    required this.gate,
    required this.qrPayload,
  });

  final bool valid;
  final TollGateModel gate;
  final String qrPayload;
}

class ProcessPaymentResponse {
  const ProcessPaymentResponse({
    required this.success,
    required this.paymentId,
    required this.amount,
    required this.hasFreePass,
    required this.balanceAfter,
  });

  final bool success;
  final String paymentId;
  final int amount;
  final bool hasFreePass;
  final int balanceAfter;
}

class TollRepository {
  TollRepository({
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

  Stream<List<TollGateModel>> tollGatesStream() {
    return _firestore
        .collection('toll_gates')
        .orderBy('name_en')
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map(TollGateModel.fromFirestore).toList());
  }

  Stream<List<TollPaymentModel>> tollPaymentsStream({int limit = 50}) {
    final uid = _uid;
    if (uid == null) return Stream.value(const []);
    return _firestore
        .collection('toll_payments')
        .where('user_id', isEqualTo: uid)
        .orderBy('created_at', descending: true)
        .limit(limit)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map(TollPaymentModel.fromFirestore).toList());
  }

  Future<VerifyGateResponse> verifyTollGate(String qrPayload) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/verifyTollGate',
      data: {
        'data': {'qrPayload': qrPayload},
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );

    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    final gateMap = (result['gate'] as Map?)?.cast<String, dynamic>();
    if (gateMap == null) throw Exception('Invalid gate response');

    return VerifyGateResponse(
      valid: result['valid'] == true,
      qrPayload: result['qrPayload'] as String? ?? qrPayload,
      gate: TollGateModel.fromMap(gateMap,
          fallbackId: gateMap['id']?.toString() ?? ''),
    );
  }

  Future<VerifyGateResponse> verifyManualGateCode(String manualCode) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/verifyTollGate',
      data: {
        'data': {'manualCode': manualCode},
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );

    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    final gateMap = (result['gate'] as Map?)?.cast<String, dynamic>();
    if (gateMap == null) throw Exception('Invalid gate response');

    return VerifyGateResponse(
      valid: result['valid'] == true,
      qrPayload: result['qrPayload'] as String? ?? manualCode,
      gate: TollGateModel.fromMap(
        gateMap,
        fallbackId: gateMap['id']?.toString() ?? '',
      ),
    );
  }

  Future<ProcessPaymentResponse> processPayment({
    required String qrPayload,
    required String vehicleId,
  }) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/processTollPayment',
      data: {
        'data': {
          'qrPayload': qrPayload,
          'vehicleId': vehicleId,
        },
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    return ProcessPaymentResponse(
      success: result['success'] == true,
      paymentId: result['paymentId'] as String? ?? '',
      amount: (result['amount'] as num?)?.toInt() ?? 0,
      hasFreePass: result['hasFreePass'] == true,
      balanceAfter: (result['balanceAfter'] as num?)?.toInt() ?? 0,
    );
  }
}
