import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_provider.dart';

final profileNameProvider = Provider<String>((ref) {
  final profile = ref.watch(currentUserProfileProvider).valueOrNull;
  if (profile == null) return '';
  final language = ref.watch(languageProvider);
  if (language == 'bn') {
    return profile.nameBn.isNotEmpty ? profile.nameBn : profile.name;
  }
  return profile.name;
});
