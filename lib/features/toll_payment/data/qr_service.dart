import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../domain/toll_payment_model.dart';

class QRService {
  QRService({
    Dio? dio,
    FirebaseAuth? auth,
    this.cloudFunctionsBaseUrl =
        'https://us-central1-tollbd-production.cloudfunctions.net',
  })  : _dio = dio ?? Dio(),
        _auth = auth ?? FirebaseAuth.instance;

  final Dio _dio;
  final FirebaseAuth _auth;
  final String cloudFunctionsBaseUrl;

  static const _offlineTokenBox = 'offline_tokens';

  Future<OfflineQRToken> generateOfflineQR({
    required String vehicleId,
    required int reservedAmount,
  }) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/generateOfflineQR',
      data: {
        'data': {
          'vehicleId': vehicleId,
          'reservedAmount': reservedAmount,
        },
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    final offline = OfflineQRToken.fromJson(result);
    await _storeToken(offline);
    return offline;
  }

  Future<List<OfflineQRToken>> getLocalTokens() async {
    final box = await _openBox();
    final tokens = <OfflineQRToken>[];
    for (final value in box.values) {
      if (value is Map) {
        tokens.add(
          OfflineQRToken.fromJson(value.cast<String, dynamic>()),
        );
      }
    }
    tokens.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return tokens;
  }

  Future<void> _storeToken(OfflineQRToken token) async {
    final box = await _openBox();
    await box.put(token.id, token.toJson());
  }

  Future<Box<dynamic>> _openBox() async {
    if (Hive.isBoxOpen(_offlineTokenBox)) {
      return Hive.box<dynamic>(_offlineTokenBox);
    }
    return Hive.openBox<dynamic>(_offlineTokenBox);
  }
}
