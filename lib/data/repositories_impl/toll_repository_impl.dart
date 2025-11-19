// lib/data/repositories_impl/toll_repository_impl.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:fpdart/fpdart.dart';
import 'package:tollswift_bd/domain/entities/vehicle_entity.dart';
import 'package:tollswift_bd/domain/entities/toll_transaction_entity.dart';
import 'package:tollswift_bd/domain/repositories/toll_repository.dart';

class TollRepositoryImpl implements TollRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  @override
  Stream<List<VehicleEntity>> getVehicles(String userId) {
    return _firestore
        .collection('vehicles')
        .where('owner_uid', isEqualTo: userId)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => VehicleEntity.fromJson(doc.data()).copyWith(id: doc.id))
            .toList());
  }

  @override
  Future<Either<String, Unit>> addVehicle(VehicleEntity vehicle) async {
    try {
      await _firestore.collection('vehicles').add(vehicle.toJson());
      return right(unit);
    } catch (e) {
      return left(e.toString());
    }
  }

  @override
  Future<Either<String, Unit>> updateVehicle(VehicleEntity vehicle) async {
    try {
      await _firestore.collection('vehicles').doc(vehicle.id).update(vehicle.toJson());
      return right(unit);
    } catch (e) {
      return left(e.toString());
    }
  }

  @override
  Future<Either<String, Unit>> deleteVehicle(String vehicleId) async {
    try {
      await _firestore.collection('vehicles').doc(vehicleId).delete();
      return right(unit);
    } catch (e) {
      return left(e.toString());
    }
  }

  @override
  Future<Either<String, Unit>> setDefaultVehicle(String vehicleId, String userId) async {
    try {
      final batch = _firestore.batch();
      final snapshot = await _firestore
          .collection('vehicles')
          .where('owner_uid', isEqualTo: userId)
          .get();

      for (var doc in snapshot.docs) {
        batch.update(doc.reference, {'is_default': doc.id == vehicleId});
      }
      await batch.commit();
      return right(unit);
    } catch (e) {
      return left(e.toString());
    }
  }

  @override
  Future<Either<String, TollTransactionEntity>> payToll({
    required String userId,
    required String vehicleId,
    required String bridgeId,
    required double amount,
  }) async {
    try {
      final vehicleDoc = await _firestore.collection('vehicles').doc(vehicleId).get();
      final bridgeDoc = await _firestore.collection('toll_rates').doc(bridgeId).get();

      if (!vehicleDoc.exists || !bridgeDoc.exists) {
        return left("Invalid vehicle or bridge");
      }

      final transaction = TollTransactionEntity(
        id: _firestore.collection('transactions').doc().id,
        userUid: userId,
        vehicleReg: vehicleDoc['reg_number'],
        bridgeName: bridgeDoc['name'],
        amount: amount,
        status: "success",
        timestamp: DateTime.now(),
      );

      await _firestore.collection('transactions').add(transaction.toJson());
      return right(transaction);
    } catch (e) {
      return left(e.toString());
    }
  }
}