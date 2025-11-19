// lib/presentation/providers/toll_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tollswift_bd/domain/entities/toll_transaction_entity.dart';
import 'package:tollswift_bd/presentation/providers/vehicle_provider.dart';

final tollPaymentProvider = FutureProvider.family<TollTransactionEntity, Map<String, dynamic>>((ref, params) async {
  final repo = ref.read(tollRepositoryProvider);
  final result = await repo.payToll(
    userId: params['userId'],
    vehicleId: params['vehicleId'],
    bridgeId: params['bridgeId'],
    amount: params['amount'],
  );
  return result.getOrElse((l) => throw Exception(l));
});