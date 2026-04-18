import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../data/auth_local_datasource.dart';
import '../../data/auth_repository.dart';
import '../../domain/auth_models.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) => throw UnimplementedError('SharedPreferences override is required'),
);

final authLocalDatasourceProvider = Provider<AuthLocalDatasource>(
  (ref) => AuthLocalDatasource(ref.watch(sharedPreferencesProvider)),
);

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(),
);

final authStateProvider = StreamProvider<User?>(
  (ref) => ref.watch(authRepositoryProvider).authStateChanges(),
);

final currentUserProfileProvider = StreamProvider<AppUser?>((ref) {
  final user = ref.watch(authStateProvider).valueOrNull;
  if (user == null) return Stream.value(null);
  return ref.watch(authRepositoryProvider).userProfileStream(user.uid);
});

class LanguageNotifier extends StateNotifier<String> {
  LanguageNotifier(this.ref)
    : super(ref.read(authLocalDatasourceProvider).getPreferredLanguage());

  final Ref ref;

  Future<void> setLanguage(String language) async {
    state = language;
    await ref.read(authLocalDatasourceProvider).setPreferredLanguage(language);
    final uid = ref.read(authRepositoryProvider).currentUser?.uid;
    if (uid != null) {
      await ref
          .read(authRepositoryProvider)
          .updatePreferredLanguage(uid, language);
    }
  }
}

final languageProvider = StateNotifierProvider<LanguageNotifier, String>(
  (ref) => LanguageNotifier(ref),
);

class HideBalanceNotifier extends StateNotifier<bool> {
  HideBalanceNotifier(this.ref)
    : super(ref.read(authLocalDatasourceProvider).getHideBalance());

  final Ref ref;

  Future<void> toggle() async {
    state = !state;
    await ref.read(authLocalDatasourceProvider).setHideBalance(state);
  }
}

final hideBalanceProvider = StateNotifierProvider<HideBalanceNotifier, bool>(
  (ref) => HideBalanceNotifier(ref),
);

class AuthController {
  AuthController(this.ref);

  final Ref ref;

  AuthRepository get _repo => ref.read(authRepositoryProvider);
  AuthLocalDatasource get _local => ref.read(authLocalDatasourceProvider);

  Future<void> saveBiometricEnabled(bool enabled) async {
    await _local.setBiometricEnabled(enabled);
    final uid = _repo.currentUser?.uid;
    if (uid != null) {
      await _repo.setBiometricEnabled(uid, enabled);
    }
  }

  bool get localBiometricEnabled => _local.getBiometricEnabled();

  Future<void> createProfile({
    required String name,
    required String nameBn,
    String? email,
    File? avatar,
  }) async {
    final user = _repo.currentUser;
    if (user == null) throw Exception('No authenticated user');
    final language = ref.read(languageProvider);
    await _repo.createUserProfile(
      uid: user.uid,
      phone: user.phoneNumber ?? '',
      name: name,
      nameBn: nameBn,
      preferredLanguage: language,
      email: email,
      avatarFile: avatar,
      biometricEnabled: localBiometricEnabled,
    );
    await _repo.updateFcmToken(user.uid);
  }

  Future<void> signOut() => _repo.signOut();
}

final authControllerProvider = Provider<AuthController>(
  (ref) => AuthController(ref),
);
