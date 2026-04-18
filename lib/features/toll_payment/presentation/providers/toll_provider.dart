import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../vehicle/presentation/providers/vehicle_provider.dart';
import '../../data/qr_service.dart';
import '../../data/toll_repository.dart';
import '../../domain/toll_gate_model.dart';
import '../../domain/toll_payment_model.dart';

final tollRepositoryProvider = Provider<TollRepository>((ref) {
  return TollRepository();
});

final qrServiceProvider = Provider<QRService>((ref) => QRService());

final tollGatesProvider = StreamProvider<List<TollGateModel>>((ref) {
  return ref.watch(tollRepositoryProvider).tollGatesStream();
});

final tollPaymentsProvider = StreamProvider<List<TollPaymentModel>>((ref) {
  return ref.watch(tollRepositoryProvider).tollPaymentsStream();
});

final scannedQrPayloadProvider = StateProvider<String?>((ref) => null);

final verifiedGateProvider = StateProvider<TollGateModel?>((ref) => null);

final lastTollPaymentIdProvider = StateProvider<String?>((ref) => null);

final offlineQrTokensProvider = FutureProvider<List<OfflineQRToken>>((ref) async {
  return ref.watch(qrServiceProvider).getLocalTokens();
});

class TollActionsController {
  TollActionsController(this.ref);

  final Ref ref;

  Future<TollGateModel> verifyGate(String qrPayload) async {
    final result = await ref.read(tollRepositoryProvider).verifyTollGate(qrPayload);
    if (!result.valid) throw Exception('QR invalid or expired');
    ref.read(scannedQrPayloadProvider.notifier).state = result.qrPayload;
    ref.read(verifiedGateProvider.notifier).state = result.gate;
    return result.gate;
  }

  Future<ProcessPaymentResponse> processPayment({String? vehicleId}) async {
    final payload = ref.read(scannedQrPayloadProvider);
    final selectedVehicle = vehicleId ?? ref.read(selectedVehicleIdProvider);
    if (payload == null || payload.isEmpty) {
      throw Exception('No QR payload found');
    }
    if (selectedVehicle == null || selectedVehicle.isEmpty) {
      throw Exception('Select a vehicle first');
    }
    final result = await ref.read(tollRepositoryProvider).processPayment(
          qrPayload: payload,
          vehicleId: selectedVehicle,
        );
    ref.read(lastTollPaymentIdProvider.notifier).state = result.paymentId;
    ref.invalidate(tollPaymentsProvider);
    return result;
  }

  Future<OfflineQRToken> generateOfflineToken({
    required String vehicleId,
    required int reservedAmount,
  }) async {
    final token = await ref.read(qrServiceProvider).generateOfflineQR(
          vehicleId: vehicleId,
          reservedAmount: reservedAmount,
        );
    ref.invalidate(offlineQrTokensProvider);
    return token;
  }
}

final tollActionsProvider = Provider<TollActionsController>(
  (ref) => TollActionsController(ref),
);
