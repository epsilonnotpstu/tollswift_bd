import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/notification_log_model.dart';
import '../providers/home_provider.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final notificationsAsync = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.md,
              ),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primary, AppColors.primaryDark],
                ),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.go('/home'),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.15),
                    ),
                    icon: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      language == 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications',
                      style: AppTextStyles.h3.copyWith(color: Colors.white),
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () async {
                      await ref.read(notificationActionsProvider).markAllAsRead();
                    },
                    icon: const Icon(Icons.done_all_rounded, color: Colors.white, size: 14),
                    label: Text(
                      language == 'bn' ? 'সব পড়া' : 'Mark all read',
                      style: AppTextStyles.bodySmall.copyWith(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: notificationsAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => Center(child: Text(error.toString())),
                data: (notifications) {
                  if (notifications.isEmpty) {
                    return Center(
                      child: Text(
                        language == 'bn' ? 'কোনো বিজ্ঞপ্তি নেই' : 'No notifications yet',
                        style: AppTextStyles.bodyMedium,
                      ),
                    );
                  }

                  final today = <NotificationLogModel>[];
                  final yesterday = <NotificationLogModel>[];
                  final older = <NotificationLogModel>[];
                  final now = DateTime.now();

                  for (final item in notifications) {
                    final diff = now.difference(item.createdAt).inHours;
                    if (diff < 24) {
                      today.add(item);
                    } else if (diff < 48) {
                      yesterday.add(item);
                    } else {
                      older.add(item);
                    }
                  }

                  return ListView(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    children: [
                      if (today.isNotEmpty) ...[
                        _SectionHeader(title: language == 'bn' ? 'আজ' : 'Today'),
                        ...today.map((item) => _NotificationTile(item: item)),
                        const SizedBox(height: AppSpacing.md),
                      ],
                      if (yesterday.isNotEmpty) ...[
                        _SectionHeader(title: language == 'bn' ? 'গতকাল' : 'Yesterday'),
                        ...yesterday.map((item) => _NotificationTile(item: item)),
                        const SizedBox(height: AppSpacing.md),
                      ],
                      if (older.isNotEmpty) ...[
                        _SectionHeader(title: language == 'bn' ? 'আগেরগুলো' : 'Earlier'),
                        ...older.map((item) => _NotificationTile(item: item)),
                      ],
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Text(
        title,
        style: AppTextStyles.bodySmall.copyWith(
          fontWeight: FontWeight.w700,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}

class _NotificationTile extends ConsumerWidget {
  const _NotificationTile({required this.item});

  final NotificationLogModel item;

  (String emoji, Color color, Color bg) _typeMeta(String type) {
    switch (type) {
      case 'wallet_credit':
        return ('💰', AppColors.success, AppColors.successBg);
      case 'toll_payment':
        return ('🛣️', AppColors.warning, AppColors.warningBg);
      case 'low_balance':
        return ('⚠️', AppColors.error, AppColors.errorBg);
      case 'pass_expiry':
        return ('📋', const Color(0xFFB45309), const Color(0xFFFFF7ED));
      case 'dispute_update':
        return ('✅', AppColors.info, AppColors.infoBg);
      default:
        return ('📢', AppColors.textSecondary, AppColors.surfaceVariant);
    }
  }

  Future<void> _onTap(BuildContext context, WidgetRef ref) async {
    await ref.read(notificationActionsProvider).markAsRead(item.id);
    if (!context.mounted) return;

    switch (item.type) {
      case 'toll_payment':
        final paymentId = item.data['paymentId']?.toString() ??
            item.data['payment_id']?.toString() ??
            item.data['reference_id']?.toString();
        if (paymentId != null && paymentId.isNotEmpty) {
          context.push('/history/receipt?paymentId=$paymentId');
          return;
        }
        return;
      case 'wallet_credit':
      case 'low_balance':
        context.push('/wallet/add');
        return;
      case 'pass_expiry':
        context.push('/passes/store');
        return;
      case 'dispute_update':
        context.push('/history');
        return;
      default:
        return;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final meta = _typeMeta(item.type);

    return InkWell(
      onTap: () => _onTap(context, ref),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: item.isRead ? Colors.white : meta.$3,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: item.isRead ? AppColors.cardBorder : meta.$2.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(meta.$1, style: const TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    language == 'bn' ? item.titleBn : item.title,
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: item.isRead ? FontWeight.w600 : FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    language == 'bn' ? item.bodyBn : item.body,
                    style: AppTextStyles.bodySmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _timeAgo(item.createdAt, language),
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textHint,
                    ),
                  ),
                ],
              ),
            ),
            if (!item.isRead) const Icon(Icons.circle, size: 8, color: AppColors.primary),
          ],
        ),
      ),
    );
  }

  String _timeAgo(DateTime time, String language) {
    final diff = DateTime.now().difference(time);
    if (diff.inMinutes < 1) return language == 'bn' ? 'এখনই' : 'just now';
    if (diff.inHours < 1) {
      return language == 'bn'
          ? '${diff.inMinutes} মিনিট আগে'
          : '${diff.inMinutes} min ago';
    }
    if (diff.inHours < 24) {
      return language == 'bn'
          ? '${diff.inHours} ঘন্টা আগে'
          : '${diff.inHours}h ago';
    }
    return language == 'bn' ? '${diff.inDays} দিন আগে' : '${diff.inDays}d ago';
  }
}
