import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/brtc_service.dart';
import '../../data/vehicle_repository.dart';
import '../../domain/vehicle_model.dart';

final vehicleRepositoryProvider = Provider<VehicleRepository>(
  (ref) => VehicleRepository(),
);

final vehiclesProvider = StreamProvider<List<VehicleModel>>((ref) {
  final uid = ref.watch(authStateProvider).valueOrNull?.uid;
  if (uid == null) return Stream.value(const []);
  return ref.watch(vehicleRepositoryProvider).vehiclesStream();
});

final activeVehicleProvider = Provider<VehicleModel?>((ref) {
  final list = ref.watch(vehiclesProvider).valueOrNull ?? const [];
  for (final vehicle in list) {
    if (vehicle.isActive) return vehicle;
  }
  return list.isNotEmpty ? list.first : null;
});

final selectedVehicleIdProvider = StateProvider<String?>((ref) {
  final active = ref.watch(activeVehicleProvider);
  return active?.id;
});

class VehicleActionsController {
  VehicleActionsController(this.ref);

  final Ref ref;

  Future<BRTCVerificationResult> verifyWithBrtc(String plateNumber) {
    return ref.read(brtcServiceProvider).verifyVehicle(plateNumber);
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
    final id = await ref.read(vehicleRepositoryProvider).addVehicle(
          plateNumber: plateNumber,
          vehicleType: vehicleType,
          make: make,
          model: model,
          color: color,
          year: year,
          nickname: nickname,
          brtcVerified: brtcVerified,
          brtcData: brtcData,
          registrationFile: registrationFile,
        );
    ref.invalidate(vehiclesProvider);
    return id;
  }

  Future<void> setActiveVehicle(String vehicleId) async {
    await ref.read(vehicleRepositoryProvider).setActiveVehicle(vehicleId);
    ref.read(selectedVehicleIdProvider.notifier).state = vehicleId;
    ref.invalidate(vehiclesProvider);
  }

  Future<void> deleteVehicle(String vehicleId) async {
    await ref.read(vehicleRepositoryProvider).deleteVehicle(vehicleId);
    ref.invalidate(vehiclesProvider);
  }
}

final vehicleActionsProvider = Provider<VehicleActionsController>(
  (ref) => VehicleActionsController(ref),
);
