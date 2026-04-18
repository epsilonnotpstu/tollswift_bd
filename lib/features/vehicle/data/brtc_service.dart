import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum BRTCStatus { verified, notFound, apiError }

class BRTCVerificationResult {
  const BRTCVerificationResult({
    required this.status,
    this.ownerName,
    this.vehicleType,
    this.make,
    this.model,
    this.year,
    this.color,
    this.taxTokenValid,
    this.fitnessCertValid,
    this.insuranceValid,
    this.raw,
  });

  final BRTCStatus status;
  final String? ownerName;
  final String? vehicleType;
  final String? make;
  final String? model;
  final int? year;
  final String? color;
  final bool? taxTokenValid;
  final bool? fitnessCertValid;
  final bool? insuranceValid;
  final Map<String, dynamic>? raw;

  bool get verified => status == BRTCStatus.verified;

  factory BRTCVerificationResult.fromJson(Map<String, dynamic> json) {
    final verified = json['verified'] == true || json['status'] == 'verified';
    return BRTCVerificationResult(
      status: verified ? BRTCStatus.verified : BRTCStatus.notFound,
      ownerName: json['owner_name'] as String?,
      vehicleType: json['vehicle_type'] as String?,
      make: json['make'] as String?,
      model: json['model'] as String?,
      year: (json['year'] as num?)?.toInt(),
      color: json['color'] as String?,
      taxTokenValid: json['tax_token_valid'] as bool?,
      fitnessCertValid: json['fitness_cert_valid'] as bool?,
      insuranceValid: json['insurance_valid'] as bool?,
      raw: json,
    );
  }
}

abstract class BRTCService {
  Future<BRTCVerificationResult> verifyVehicle(String plateNumber);
}

class BRTCServiceMock implements BRTCService {
  @override
  Future<BRTCVerificationResult> verifyVehicle(String plateNumber) async {
    await Future.delayed(const Duration(seconds: 2));
    final random = Random().nextDouble();
    if (random < 0.7) {
      return BRTCVerificationResult(
        status: BRTCStatus.verified,
        ownerName: 'মোহাম্মদ রহিম',
        vehicleType: 'car',
        make: 'Toyota',
        model: 'Corolla',
        year: 2019,
        color: 'White',
        taxTokenValid: true,
        fitnessCertValid: true,
        insuranceValid: true,
        raw: {
          'source': 'mock',
          'plate': plateNumber,
          'verified': true,
        },
      );
    }
    if (random < 0.9) {
      return const BRTCVerificationResult(status: BRTCStatus.notFound);
    }
    return const BRTCVerificationResult(status: BRTCStatus.apiError);
  }
}

class BRTCServiceReal implements BRTCService {
  BRTCServiceReal({
    required this.apiKey,
    required this.baseUrl,
    Dio? dio,
  }) : _dio = dio ?? Dio();

  final String apiKey;
  final String baseUrl;
  final Dio _dio;

  @override
  Future<BRTCVerificationResult> verifyVehicle(String plateNumber) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '$baseUrl/vehicles/verify',
      queryParameters: {'plate': plateNumber},
      options: Options(
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
      ),
    );
    if (response.statusCode == 200 && response.data != null) {
      return BRTCVerificationResult.fromJson(response.data!);
    }
    throw Exception('BRTC API error: ${response.statusCode}');
  }
}

final brtcServiceProvider = Provider<BRTCService>((ref) {
  const useRealApi = bool.fromEnvironment(
    'USE_BRTC_REAL_API',
    defaultValue: false,
  );
  if (useRealApi) {
    return BRTCServiceReal(
      apiKey: const String.fromEnvironment('BRTC_API_KEY'),
      baseUrl: const String.fromEnvironment(
        'BRTC_BASE_URL',
        defaultValue: 'https://api.brtc.gov.bd/v1',
      ),
    );
  }
  return BRTCServiceMock();
});
