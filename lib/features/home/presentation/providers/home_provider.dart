import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/notification_repository.dart';
import '../../domain/notification_log_model.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

final greetingProvider = Provider<String>((ref) {
  final language = ref.watch(languageProvider);
  final hour = DateTime.now().hour;
  if (hour < 12) return language == 'bn' ? 'সুপ্রভাত' : 'Good morning';
  if (hour < 17) return language == 'bn' ? 'শুভ অপরাহ্ন' : 'Good afternoon';
  return language == 'bn' ? 'শুভ সন্ধ্যা' : 'Good evening';
});

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository();
});

final notificationsProvider = StreamProvider<List<NotificationLogModel>>((ref) {
  return ref.watch(notificationRepositoryProvider).notificationsStream();
});

final unreadNotificationCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationsProvider).valueOrNull ?? const [];
  return notifications.where((item) => !item.isRead).length;
});

class NotificationActionsController {
  NotificationActionsController(this.ref);
  final Ref ref;

  Future<void> markAsRead(String notificationId) {
    return ref.read(notificationRepositoryProvider).markAsRead(notificationId);
  }

  Future<void> markAllAsRead() {
    final notifications = ref.read(notificationsProvider).valueOrNull ?? const [];
    return ref.read(notificationRepositoryProvider).markAllAsRead(notifications);
  }
}

final notificationActionsProvider = Provider<NotificationActionsController>(
  (ref) => NotificationActionsController(ref),
);
