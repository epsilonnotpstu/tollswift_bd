import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_provider.dart';

final greetingProvider = Provider<String>((ref) {
  final language = ref.watch(languageProvider);
  final hour = DateTime.now().hour;
  if (hour < 12) return language == 'bn' ? 'সুপ্রভাত' : 'Good morning';
  if (hour < 17) return language == 'bn' ? 'শুভ অপরাহ্ন' : 'Good afternoon';
  return language == 'bn' ? 'শুভ সন্ধ্যা' : 'Good evening';
});
