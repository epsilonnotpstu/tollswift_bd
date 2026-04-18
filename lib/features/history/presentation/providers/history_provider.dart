import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/history_repository.dart';
import '../../domain/trip_model.dart';
import '../../../toll_payment/domain/toll_payment_model.dart';

final historyRepositoryProvider = Provider<HistoryRepository>((ref) {
  return HistoryRepository();
});

final tripsProvider = StreamProvider<List<TripModel>>((ref) {
  return ref.watch(historyRepositoryProvider).tripsStream();
});

final receiptPaymentProvider =
    StreamProvider.family<TollPaymentModel?, String>((
  ref,
  paymentId,
) {
  return ref.watch(historyRepositoryProvider).tollPaymentById(paymentId);
});

class HistoryActionsController {
  HistoryActionsController(this.ref);
  final Ref ref;

  Future<Map<String, dynamic>> createDispute({
    required String tollPaymentId,
    required String reason,
    required String description,
    List<String> evidenceUrls = const [],
  }) {
    return ref.read(historyRepositoryProvider).submitDispute(
          tollPaymentId: tollPaymentId,
          reason: reason,
          description: description,
          evidenceUrls: evidenceUrls,
        );
  }
}

final historyActionsProvider = Provider<HistoryActionsController>(
  (ref) => HistoryActionsController(ref),
);
