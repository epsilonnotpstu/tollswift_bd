// lib/presentation/providers/vehicle_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tollswift_bd/data/repositories_impl/toll_repository_impl.dart';
import 'package:tollswift_bd/domain/entities/vehicle_entity.dart';
import 'package:tollswift_bd/presentation/providers/auth_provider.dart';

final tollRepositoryProvider = Provider((ref) => TollRepositoryImpl());

final vehicleListProvider = StreamProvider<List<VehicleEntity>>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return Stream.value([]);
  return ref.watch(tollRepositoryProvider).getVehicles(user.uid);
});