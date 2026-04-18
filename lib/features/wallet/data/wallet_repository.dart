import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../domain/transaction_model.dart';
import 'sslcommerz_service.dart';

class WalletRepository {
  WalletRepository({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
    SSLCommerzService? sslCommerzService,
  }) : _firestore = firestore ?? FirebaseFirestore.instance,
       _auth = auth ?? FirebaseAuth.instance,
       _sslCommerzService = sslCommerzService ?? SSLCommerzService();

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;
  final SSLCommerzService _sslCommerzService;

  String? get _uid => _auth.currentUser?.uid;

  Stream<int> walletBalanceStream() {
    final uid = _uid;
    if (uid == null) return Stream.value(0);
    return _firestore
        .collection('users')
        .doc(uid)
        .snapshots()
        .map((doc) => (doc.data()?['wallet_balance'] as num?)?.toInt() ?? 0);
  }

  Stream<List<TransactionModel>> transactionsStream({
    String? filter,
    int limit = 50,
  }) {
    final uid = _uid;
    if (uid == null) return Stream.value(const []);

    Query<Map<String, dynamic>> query = _firestore
        .collection('transactions')
        .where('user_id', isEqualTo: uid)
        .orderBy('created_at', descending: true)
        .limit(limit);

    if (filter != null && filter != 'all') {
      query = query.where('type', isEqualTo: filter);
    }

    return query.snapshots().map(
      (snapshot) => snapshot.docs.map(TransactionModel.fromFirestore).toList(),
    );
  }

  Stream<TransactionModel?> transactionById(String txId) {
    return _firestore.collection('transactions').doc(txId).snapshots().map((
      doc,
    ) {
      if (!doc.exists) return null;
      return TransactionModel.fromFirestore(doc);
    });
  }

  Future<SSLCommerzSession> createDepositSession({
    required int amountPaisa,
    required String paymentMethod,
  }) {
    return _sslCommerzService.createSession(
      amountPaisa: amountPaisa,
      paymentMethod: paymentMethod,
    );
  }

  Future<bool> validateSSLPayment(String transactionId) {
    return _sslCommerzService.validatePayment(transactionId);
  }
}
