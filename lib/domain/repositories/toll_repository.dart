// lib/domain/repositories/toll_repository.dart
import 'package:fpdart/fpdart.dart';
import '../entities/vehicle_entity.dart';
import '../entities/toll_transaction_entity.dart';

abstract class TollRepository {
  Stream<List<VehicleEntity>> getVehicles(String userId);
  Future<Either<String, Unit>> addVehicle(VehicleEntity vehicle);
  Future<Either<String, Unit>> updateVehicle(VehicleEntity vehicle);
  Future<Either<String, Unit>> deleteVehicle(String vehicleId);
  Future<Either<String, Unit>> setDefaultVehicle(String vehicleId, String userId);

  Future<Either<String, TollTransactionEntity>> payToll({
    required String userId,
    required String vehicleId,
    required String bridgeId,
    required double amount,
  });
}