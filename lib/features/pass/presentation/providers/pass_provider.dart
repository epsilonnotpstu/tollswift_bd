import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/pass_repository.dart';
import '../../domain/pass_model.dart';

final passRepositoryProvider = Provider<PassRepository>((ref) {
  return PassRepository();
});

final passesProvider = StreamProvider<List<PassModel>>((ref) {
  return ref.watch(passRepositoryProvider).passesStream();
});

final activePassesProvider = Provider<List<PassModel>>((ref) {
  final passes = ref.watch(passesProvider).valueOrNull ?? const [];
  return passes.where((item) => item.isActive).toList();
});

class PassActionsController {
  PassActionsController(this.ref);
  final Ref ref;

  Future<PurchasePassResponse> purchasePass({
    required String vehicleId,
    required String vehicleType,
    required String passType,
  }) async {
    final result = await ref.read(passRepositoryProvider).purchasePass(
          vehicleId: vehicleId,
          vehicleType: vehicleType,
          passType: passType,
        );
    ref.invalidate(passesProvider);
    return result;
  }
}

final passActionsProvider = Provider<PassActionsController>(
  (ref) => PassActionsController(ref),
);
