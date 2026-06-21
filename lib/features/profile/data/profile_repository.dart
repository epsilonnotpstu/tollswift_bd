import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';

import '../domain/family_account_model.dart';
import '../domain/nid_verification_model.dart';

class ProfileRepository {
  ProfileRepository({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
    FirebaseStorage? storage,
    Dio? dio,
    this.cloudFunctionsBaseUrl =
        'https://us-central1-tollbd-production.cloudfunctions.net',
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance,
        _storage = storage ?? FirebaseStorage.instance,
        _dio = dio ?? Dio();

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;
  final FirebaseStorage _storage;
  final Dio _dio;
  final String cloudFunctionsBaseUrl;

  String? get _uid => _auth.currentUser?.uid;

  Stream<FamilyAccountModel?> familyAccountStream() {
    final uid = _uid;
    if (uid == null) return Stream.value(null);

    return _firestore
        .collection('family_accounts')
        .where('member_uids', arrayContains: uid)
        .limit(1)
        .snapshots()
        .map((snapshot) {
      if (snapshot.docs.isEmpty) return null;
      return FamilyAccountModel.fromFirestore(snapshot.docs.first);
    });
  }

  Stream<NidVerificationModel?> nidVerificationStream() {
    final uid = _uid;
    if (uid == null) return Stream.value(null);

    return _firestore
        .collection('nid_verifications')
        .doc(uid)
        .snapshots()
        .map((doc) => doc.exists ? NidVerificationModel.fromFirestore(doc) : null);
  }

  Future<String> createFamilyAccount({
    required String name,
    required bool sharedWallet,
  }) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final response = await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/createFamilyAccount',
      data: {
        'data': {
          'name': name,
          'sharedWallet': sharedWallet,
        }
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );

    final body = response.data ?? {};
    final result = (body['result'] as Map?)?.cast<String, dynamic>() ?? body;
    final familyId = result['familyId'] as String?;
    if (familyId == null || familyId.isEmpty) {
      throw Exception('Failed to create family account');
    }
    return familyId;
  }

  Future<void> inviteFamilyMember({
    required String familyId,
    required String phone,
    String role = 'member',
  }) async {
    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/inviteFamilyMember',
      data: {
        'data': {
          'familyId': familyId,
          'phone': phone,
          'role': role,
        }
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<void> setSharedWallet({
    required String familyId,
    required bool enabled,
  }) async {
    await _firestore.collection('family_accounts').doc(familyId).set({
      'shared_wallet': enabled,
      'updated_at': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> submitNidVerification({
    required String nidNumber,
    String? dateOfBirth,
    required File nidFront,
    required File nidBack,
    required File selfie,
  }) async {
    final uid = _uid;
    if (uid == null) throw Exception('User not authenticated');

    final token = await _auth.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final frontUrl = await _uploadFile(uid: uid, file: nidFront, label: 'nid_front');
    final backUrl = await _uploadFile(uid: uid, file: nidBack, label: 'nid_back');
    final selfieUrl = await _uploadFile(uid: uid, file: selfie, label: 'selfie');

    await _dio.post<Map<String, dynamic>>(
      '$cloudFunctionsBaseUrl/submitNIDVerification',
      data: {
        'data': {
          'nidNumber': nidNumber,
          'dateOfBirth': dateOfBirth,
          'nidFrontUrl': frontUrl,
          'nidBackUrl': backUrl,
          'selfieUrl': selfieUrl,
        }
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<String> _uploadFile({
    required String uid,
    required File file,
    required String label,
  }) async {
    final ext = file.path.split('.').last;
    final ref = _storage
        .ref()
        .child('nid_verifications/$uid/$label-${DateTime.now().millisecondsSinceEpoch}.$ext');
    await ref.putFile(file);
    return ref.getDownloadURL();
  }
}
