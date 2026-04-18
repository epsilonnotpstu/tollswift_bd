import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/wallet_repository.dart';
import '../../domain/transaction_model.dart';

final walletRepositoryProvider = Provider<WalletRepository>(
  (ref) => WalletRepository(),
);

final walletBalanceProvider = StreamProvider<int>((ref) {
  final uid = ref.watch(authStateProvider).valueOrNull?.uid;
  if (uid == null) return Stream.value(0);
  return ref.watch(walletRepositoryProvider).walletBalanceStream();
});

final transactionsProvider =
    StreamProvider.family<List<TransactionModel>, String?>((ref, filter) {
  final uid = ref.watch(authStateProvider).valueOrNull?.uid;
  if (uid == null) return Stream.value(const []);
  return ref.watch(walletRepositoryProvider).transactionsStream(filter: filter);
});

final recentTransactionsProvider = StreamProvider<List<TransactionModel>>((
  ref,
) {
  final uid = ref.watch(authStateProvider).valueOrNull?.uid;
  if (uid == null) return Stream.value(const []);
  return ref.watch(walletRepositoryProvider).transactionsStream(limit: 3);
});

final transactionByIdProvider =
    StreamProvider.family<TransactionModel?, String>((ref, txId) {
  return ref.watch(walletRepositoryProvider).transactionById(txId);
});

final weeklySpendingProvider = Provider<List<double>>((ref) {
  final txList =
      ref.watch(transactionsProvider('toll')).valueOrNull ?? const [];
  final now = DateTime.now();
  final days = List<double>.filled(7, 0);
  for (final tx in txList) {
    final diff = now.difference(tx.createdAt).inDays;
    if (diff >= 0 && diff < 7) {
      final index = 6 - diff;
      days[index] += tx.amount / 100;
    }
  }
  return days;
});

class WalletActionController {
  WalletActionController(this.ref);
  final Ref ref;

  Future<(String paymentUrl, String transactionId)> createSession({
    required int amountPaisa,
    required String paymentMethod,
  }) async {
    final session =
        await ref.read(walletRepositoryProvider).createDepositSession(
              amountPaisa: amountPaisa,
              paymentMethod: paymentMethod,
            );
    return (session.paymentUrl, session.transactionId);
  }

  Future<bool> validatePayment(String txId) {
    return ref.read(walletRepositoryProvider).validateSSLPayment(txId);
  }
}

final walletActionControllerProvider = Provider<WalletActionController>(
  (ref) => WalletActionController(ref),
);
