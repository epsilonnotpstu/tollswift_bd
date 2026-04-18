import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

class SSLCommerzSession {
  const SSLCommerzSession({
    required this.paymentUrl,
    required this.transactionId,
  });

  final String paymentUrl;
  final String transactionId;
}

class SSLCommerzService {
  SSLCommerzService({
    Dio? dio,
    FirebaseAuth? auth,
    this.cloudFunctionsBaseUrl =
        'https://us-central1-tollbd-production.cloudfunctions.net',
  }) : _dio = dio ?? Dio(),
       _auth = auth ?? FirebaseAuth.instance;

  final Dio _dio;
  final FirebaseAuth _auth;
  final String cloudFunctionsBaseUrl;

  Future<SSLCommerzSession> createSession({
    required int amountPaisa,
    required String paymentMethod,
    String currency = 'BDT',
  }) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) {
      throw Exception('User not authenticated');
    }

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/createSSLCommerzSession',
      data: {
        'data': {
          'amount': amountPaisa,
          'paymentMethod': paymentMethod,
          'currency': currency,
        },
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );

    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    final paymentUrl = result['paymentUrl'] as String?;
    final transactionId = result['transactionId'] as String?;
    if (paymentUrl == null || transactionId == null) {
      throw Exception('Invalid payment session response');
    }
    return SSLCommerzSession(
      paymentUrl: paymentUrl,
      transactionId: transactionId,
    );
  }

  Future<bool> validatePayment(String transactionId) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) return false;

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/validateSSLPayment',
      data: {
        'data': {'transactionId': transactionId},
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    return result['valid'] == true;
  }
}
