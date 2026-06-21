import 'package:cloud_firestore/cloud_firestore.dart';

class NotificationLogModel {
  const NotificationLogModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.titleBn,
    required this.body,
    required this.bodyBn,
    required this.data,
    required this.isRead,
    required this.createdAt,
    this.readAt,
  });

  final String id;
  final String userId;
  final String type;
  final String title;
  final String titleBn;
  final String body;
  final String bodyBn;
  final Map<String, dynamic> data;
  final bool isRead;
  final DateTime createdAt;
  final DateTime? readAt;

  factory NotificationLogModel.fromFirestore(
      DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    return NotificationLogModel(
      id: data['id'] as String? ?? doc.id,
      userId: data['user_id'] as String? ?? '',
      type: data['type'] as String? ?? 'system',
      title: data['title'] as String? ?? '',
      titleBn: data['title_bn'] as String? ?? '',
      body: data['body'] as String? ?? '',
      bodyBn: data['body_bn'] as String? ?? '',
      data: (data['data'] as Map?)?.cast<String, dynamic>() ?? const {},
      isRead: data['is_read'] as bool? ?? false,
      createdAt: (data['created_at'] as Timestamp?)?.toDate() ?? DateTime.now(),
      readAt: (data['read_at'] as Timestamp?)?.toDate(),
    );
  }
}
