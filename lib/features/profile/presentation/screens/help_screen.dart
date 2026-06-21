import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class HelpScreen extends ConsumerStatefulWidget {
  const HelpScreen({super.key});

  @override
  ConsumerState<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends ConsumerState<HelpScreen> {
  final _searchController = TextEditingController();

  final List<({String qBn, String qEn, String aBn, String aEn})> _faq = [
    (
      qBn: 'QR কোড স্ক্যান হচ্ছে না কেন?',
      qEn: 'Why is QR not scanning?',
      aBn: 'নিশ্চিত করুন ক্যামেরা অনুমতি চালু আছে, আলো পর্যাপ্ত আছে, এবং QR কোড পরিষ্কার।',
      aEn: 'Ensure camera permission is enabled, light is sufficient, and QR code is clear.'
    ),
    (
      qBn: 'আমার টাকা কাটা গেছে কিন্তু গেট খুলেনি',
      qEn: 'Money deducted but gate did not open',
      aBn: 'এটি সাময়িক নেটওয়ার্ক সমস্যা হতে পারে। ট্রিপ হিস্ট্রি থেকে বিরোধ দাখিল করুন।',
      aEn: 'This may be temporary network delay. Please raise a dispute from trip history.'
    ),
    (
      qBn: 'মাসিক পাস কিভাবে কাজ করে?',
      qEn: 'How does monthly pass work?',
      aBn: 'সক্রিয় পাস থাকলে একই ক্যাটাগরির গাড়ির জন্য টোল চার্জ ০ হয়।',
      aEn: 'With an active pass, toll charge becomes 0 for that vehicle category.'
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _open(Uri uri) async {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final query = _searchController.text.trim().toLowerCase();

    final filteredFaq = _faq.where((item) {
      final q = language == 'bn' ? item.qBn : item.qEn;
      final a = language == 'bn' ? item.aBn : item.aEn;
      if (query.isEmpty) return true;
      return q.toLowerCase().contains(query) || a.toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(language == 'bn' ? 'সাহায্য ও FAQ' : 'Help & FAQ'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          TextField(
            controller: _searchController,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: language == 'bn' ? 'কিছু খুঁজুন...' : 'Search help...',
              prefixIcon: const Icon(Icons.search_rounded),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              _QuickHelpCard(
                emoji: '💳',
                title: language == 'bn' ? 'কিভাবে টাকা যোগ করবেন' : 'How to add money',
              ),
              _QuickHelpCard(
                emoji: '🚗',
                title: language == 'bn' ? 'গাড়ি কিভাবে যোগ করবেন' : 'How to add vehicle',
              ),
              _QuickHelpCard(
                emoji: '🛣️',
                title: language == 'bn' ? 'টোল পেমেন্ট সমস্যা' : 'Toll payment issues',
              ),
              _QuickHelpCard(
                emoji: '📋',
                title: language == 'bn' ? 'মাসিক পাস সম্পর্কে' : 'About monthly pass',
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          const Text(
            'FAQ',
            style: AppTextStyles.h4,
          ),
          const SizedBox(height: AppSpacing.sm),
          ...filteredFaq.map(
            (item) => Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: ExpansionTile(
                title: Text(
                  language == 'bn' ? item.qBn : item.qEn,
                  style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                ),
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.md,
                      0,
                      AppSpacing.md,
                      AppSpacing.md,
                    ),
                    child: Text(
                      language == 'bn' ? item.aBn : item.aEn,
                      style: AppTextStyles.bodySmall,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          _ContactButton(
            icon: Icons.phone_rounded,
            title: language == 'bn' ? 'কল করুন' : 'Call us',
            subtitle: '16XXX',
            onTap: () => _open(Uri(scheme: 'tel', path: '16XXX')),
          ),
          const SizedBox(height: AppSpacing.sm),
          _ContactButton(
            icon: Icons.chat_bubble_outline_rounded,
            title: language == 'bn' ? 'লাইভ চ্যাট' : 'Live chat',
            subtitle: 'WhatsApp',
            onTap: () => _open(Uri.parse('https://wa.me/8801700000000')),
          ),
          const SizedBox(height: AppSpacing.sm),
          _ContactButton(
            icon: Icons.email_outlined,
            title: language == 'bn' ? 'ইমেইল করুন' : 'Email support',
            subtitle: 'support@tollbd.app',
            onTap: () => _open(Uri(
              scheme: 'mailto',
              path: 'support@tollbd.app',
              query: 'subject=TollBD Support',
            )),
          ),
          const SizedBox(height: AppSpacing.lg),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('TollBD v1.0.0 (build 1)', style: AppTextStyles.bodySmall),
                const SizedBox(height: AppSpacing.sm),
                FilledButton.icon(
                  onPressed: () => _open(Uri.parse(
                    'https://play.google.com/store/apps/details?id=com.tollbd.app',
                  )),
                  icon: const Icon(Icons.star_rate_rounded),
                  label: Text(language == 'bn' ? 'রেটিং দিন' : 'Rate us'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickHelpCard extends StatelessWidget {
  const _QuickHelpCard({required this.emoji, required this.title});

  final String emoji;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: AppSpacing.sm),
          Expanded(child: Text(title, style: AppTextStyles.bodySmall)),
        ],
      ),
    );
  }
}

class _ContactButton extends StatelessWidget {
  const _ContactButton({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: AppColors.surfaceVariant,
              child: Icon(icon, color: AppColors.textPrimary),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.bodyMedium),
                  Text(subtitle, style: AppTextStyles.bodySmall),
                ],
              ),
            ),
            const Icon(Icons.open_in_new_rounded, size: 18),
          ],
        ),
      ),
    );
  }
}
