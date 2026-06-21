import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:io';

import '../../data/profile_repository.dart';
import '../../domain/family_account_model.dart';
import '../../domain/nid_verification_model.dart';
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

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository();
});

final familyAccountProvider = StreamProvider<FamilyAccountModel?>((ref) {
  final uid = ref.watch(authStateProvider).valueOrNull?.uid;
  if (uid == null) return Stream.value(null);
  return ref.watch(profileRepositoryProvider).familyAccountStream();
});

final nidVerificationProvider = StreamProvider<NidVerificationModel?>((ref) {
  final uid = ref.watch(authStateProvider).valueOrNull?.uid;
  if (uid == null) return Stream.value(null);
  return ref.watch(profileRepositoryProvider).nidVerificationStream();
});

class ProfileActionsController {
  ProfileActionsController(this.ref);
  final Ref ref;

  Future<void> createFamilyAccount({
    required String name,
    required bool sharedWallet,
  }) async {
    await ref.read(profileRepositoryProvider).createFamilyAccount(
          name: name,
          sharedWallet: sharedWallet,
        );
    ref.invalidate(familyAccountProvider);
  }

  Future<void> inviteFamilyMember({
    required String familyId,
    required String phone,
    String role = 'member',
  }) async {
    await ref.read(profileRepositoryProvider).inviteFamilyMember(
          familyId: familyId,
          phone: phone,
          role: role,
        );
    ref.invalidate(familyAccountProvider);
  }

  Future<void> setSharedWallet({
    required String familyId,
    required bool enabled,
  }) async {
    await ref.read(profileRepositoryProvider).setSharedWallet(
          familyId: familyId,
          enabled: enabled,
        );
    ref.invalidate(familyAccountProvider);
  }

  Future<void> submitNidVerification({
    required String nidNumber,
    String? dateOfBirth,
    required File nidFront,
    required File nidBack,
    required File selfie,
  }) async {
    await ref.read(profileRepositoryProvider).submitNidVerification(
          nidNumber: nidNumber,
          dateOfBirth: dateOfBirth,
          nidFront: nidFront,
          nidBack: nidBack,
          selfie: selfie,
        );
    ref.invalidate(nidVerificationProvider);
    ref.invalidate(currentUserProfileProvider);
  }
}

final profileActionsProvider = Provider<ProfileActionsController>(
  (ref) => ProfileActionsController(ref),
);
