import 'package:cloud_firestore/cloud_firestore.dart';

class NidVerificationModel {
  const NidVerificationModel({
    required this.userId,
    required this.nidNumber,
    required this.nidFrontUrl,
    required this.nidBackUrl,
    required this.selfieUrl,
    required this.status,
    required this.rejectionReason,
    this.submittedAt,
    this.reviewedAt,
  });

  final String userId;
  final String nidNumber;
  final String nidFrontUrl;
  final String nidBackUrl;
  final String selfieUrl;
  final String status;
  final String rejectionReason;
  final DateTime? submittedAt;
  final DateTime? reviewedAt;

  factory NidVerificationModel.fromFirestore(
      DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    return NidVerificationModel(
      userId: data['user_id'] as String? ?? doc.id,
      nidNumber: data['nid_number'] as String? ?? '',
      nidFrontUrl: data['nid_front_url'] as String? ?? '',
      nidBackUrl: data['nid_back_url'] as String? ?? '',
      selfieUrl: data['selfie_url'] as String? ?? '',
      status: data['status'] as String? ?? 'pending',
      rejectionReason: data['rejection_reason'] as String? ?? '',
      submittedAt: (data['submitted_at'] as Timestamp?)?.toDate(),
      reviewedAt: (data['reviewed_at'] as Timestamp?)?.toDate(),
    );
  }
}
