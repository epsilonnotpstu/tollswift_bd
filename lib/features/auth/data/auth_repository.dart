import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_storage/firebase_storage.dart';

import '../domain/auth_models.dart';

typedef CodeSentCallback = void Function(
    String verificationId, int? resendToken);

class AuthRepository {
  AuthRepository({
    FirebaseAuth? auth,
    FirebaseFirestore? firestore,
    FirebaseStorage? storage,
    FirebaseMessaging? messaging,
  })  : _auth = auth ?? FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance,
        _storage = storage ?? FirebaseStorage.instance,
        _messaging = messaging ?? FirebaseMessaging.instance;

  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;
  final FirebaseStorage _storage;
  final FirebaseMessaging _messaging;

  Stream<User?> authStateChanges() => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;

  Stream<AppUser?> userProfileStream(String uid) {
    return _firestore.collection('users').doc(uid).snapshots().map((doc) {
      final data = doc.data();
      if (data == null) return null;
      return AppUser.fromMap(data);
    });
  }

  Future<AppUser?> getUserProfile(String uid) async {
    final doc = await _firestore.collection('users').doc(uid).get();
    final data = doc.data();
    if (data == null) return null;
    return AppUser.fromMap(data);
  }

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required PhoneVerificationCompleted verificationCompleted,
    required PhoneVerificationFailed verificationFailed,
    required CodeSentCallback codeSent,
    required PhoneCodeAutoRetrievalTimeout codeAutoRetrievalTimeout,
  }) {
    return _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: verificationCompleted,
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: codeAutoRetrievalTimeout,
      timeout: const Duration(seconds: 120),
    );
  }

  Future<UserCredential> signInWithOtp({
    required String verificationId,
    required String smsCode,
  }) async {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    return _auth.signInWithCredential(credential);
  }

  Future<void> createUserProfile({
    required String uid,
    required String phone,
    required String name,
    required String nameBn,
    required String preferredLanguage,
    String? email,
    File? avatarFile,
    bool biometricEnabled = false,
  }) async {
    String? avatarUrl;
    if (avatarFile != null) {
      final ref = _storage.ref().child('users/$uid/avatar.jpg');
      await ref.putFile(avatarFile);
      avatarUrl = await ref.getDownloadURL();
    }

    final fcmToken = await _messaging.getToken();
    final user = AppUser(
      uid: uid,
      phone: phone,
      name: name,
      nameBn: nameBn,
      email: email,
      avatarUrl: avatarUrl,
      preferredLanguage: preferredLanguage,
      walletBalance: 0,
      biometricEnabled: biometricEnabled,
      fcmToken: fcmToken,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    await _firestore
        .collection('users')
        .doc(uid)
        .set(user.toMap(), SetOptions(merge: true));
  }

  Future<void> setBiometricEnabled(String uid, bool enabled) async {
    await _firestore.collection('users').doc(uid).set({
      'biometric_enabled': enabled,
      'updated_at': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> updatePreferredLanguage(String uid, String language) async {
    await _firestore.collection('users').doc(uid).set({
      'preferred_language': language,
      'updated_at': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> updateFcmToken(String uid) async {
    final token = await _messaging.getToken();
    if (token == null) return;
    await _firestore.collection('users').doc(uid).set({
      'fcm_token': token,
      'updated_at': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> signOut() => _auth.signOut();
}
