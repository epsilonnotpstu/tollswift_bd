import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../domain/notification_log_model.dart';

class NotificationRepository {
  NotificationRepository({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  String? get _uid => _auth.currentUser?.uid;

  Stream<List<NotificationLogModel>> notificationsStream({int limit = 100}) {
    final uid = _uid;
    if (uid == null) return Stream.value(const []);

    return _firestore
        .collection('notifications_log')
        .where('user_id', isEqualTo: uid)
        .orderBy('created_at', descending: true)
        .limit(limit)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map(NotificationLogModel.fromFirestore).toList());
  }

  Future<void> markAsRead(String notificationId) async {
    final uid = _uid;
    if (uid == null) throw Exception('User not authenticated');

    await _firestore.collection('notifications_log').doc(notificationId).set({
      'is_read': true,
      'read_at': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> markAllAsRead(List<NotificationLogModel> notifications) async {
    final uid = _uid;
    if (uid == null) throw Exception('User not authenticated');

    final unread = notifications.where((item) => !item.isRead).toList();
    if (unread.isEmpty) return;

    final batch = _firestore.batch();
    for (final item in unread) {
      final ref = _firestore.collection('notifications_log').doc(item.id);
      batch.set(ref, {
        'is_read': true,
        'read_at': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    }

    await batch.commit();
  }
}
