class WalletModel {
  const WalletModel({
    required this.userId,
    required this.balance,
    this.lowBalanceThreshold = 20000,
  });

  final String userId;
  final int balance;
  final int lowBalanceThreshold;

  bool get isLowBalance => balance < lowBalanceThreshold;
}
