import 'package:cloud_firestore/cloud_firestore.dart';

class TransactionModel {
  const TransactionModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.status,
    required this.amount,
    this.balanceBefore,
    this.balanceAfter,
    required this.description,
    this.descriptionBn,
    this.paymentMethod,
    this.sslcommerzTranId,
    this.sslcommerzValId,
    this.gatewayResponse,
    this.referenceId,
    required this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String userId;
  final String type;
  final String status;
  final int amount;
  final int? balanceBefore;
  final int? balanceAfter;
  final String description;
  final String? descriptionBn;
  final String? paymentMethod;
  final String? sslcommerzTranId;
  final String? sslcommerzValId;
  final Map<String, dynamic>? gatewayResponse;
  final String? referenceId;
  final DateTime createdAt;
  final DateTime? updatedAt;

  bool get isCredit => type == 'deposit' || type == 'refund';

  factory TransactionModel.fromFirestore(
    DocumentSnapshot<Map<String, dynamic>> doc,
  ) {
    final data = doc.data() ?? {};
    return TransactionModel(
      id: data['id'] as String? ?? doc.id,
      userId: data['user_id'] as String? ?? '',
      type: data['type'] as String? ?? 'deposit',
      status: data['status'] as String? ?? 'pending',
      amount: (data['amount'] as num?)?.toInt() ?? 0,
      balanceBefore: (data['balance_before'] as num?)?.toInt(),
      balanceAfter: (data['balance_after'] as num?)?.toInt(),
      description:
          data['description'] as String? ??
          _defaultDescription(data['type'] as String?),
      descriptionBn: data['description_bn'] as String?,
      paymentMethod: data['payment_method'] as String?,
      sslcommerzTranId: data['sslcommerz_tran_id'] as String?,
      sslcommerzValId: data['sslcommerz_val_id'] as String?,
      gatewayResponse: (data['gateway_response'] as Map?)
          ?.cast<String, dynamic>(),
      referenceId: data['reference_id'] as String?,
      createdAt: (data['created_at'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updated_at'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'type': type,
      'status': status,
      'amount': amount,
      'balance_before': balanceBefore,
      'balance_after': balanceAfter,
      'description': description,
      'description_bn': descriptionBn,
      'payment_method': paymentMethod,
      'sslcommerz_tran_id': sslcommerzTranId,
      'sslcommerz_val_id': sslcommerzValId,
      'gateway_response': gatewayResponse,
      'reference_id': referenceId,
      'created_at': Timestamp.fromDate(createdAt),
      'updated_at': Timestamp.fromDate(updatedAt ?? DateTime.now()),
    };
  }

  static String _defaultDescription(String? type) {
    switch (type) {
      case 'toll':
        return 'Toll charge';
      case 'refund':
        return 'Refund';
      default:
        return 'Wallet top-up';
    }
  }
}
