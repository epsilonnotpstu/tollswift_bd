import 'package:cloud_firestore/cloud_firestore.dart';

class AppUser {
  const AppUser({
    required this.uid,
    required this.phone,
    required this.name,
    required this.nameBn,
    this.email,
    this.avatarUrl,
    this.preferredLanguage = 'bn',
    this.nidNumber,
    this.nidVerified = false,
    this.walletBalance = 0,
    this.biometricEnabled = false,
    this.fcmToken,
    this.accountStatus = 'active',
    this.createdAt,
    this.updatedAt,
  });

  final String uid;
  final String phone;
  final String name;
  final String nameBn;
  final String? email;
  final String? avatarUrl;
  final String preferredLanguage;
  final String? nidNumber;
  final bool nidVerified;
  final int walletBalance;
  final bool biometricEnabled;
  final String? fcmToken;
  final String accountStatus;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory AppUser.fromMap(Map<String, dynamic> map) {
    return AppUser(
      uid: map['uid'] as String? ?? '',
      phone: map['phone'] as String? ?? '',
      name: map['name'] as String? ?? '',
      nameBn: map['name_bn'] as String? ?? '',
      email: map['email'] as String?,
      avatarUrl: map['avatar_url'] as String?,
      preferredLanguage: map['preferred_language'] as String? ?? 'bn',
      nidNumber: map['nid_number'] as String?,
      nidVerified: map['nid_verified'] as bool? ?? false,
      walletBalance: (map['wallet_balance'] as num?)?.toInt() ?? 0,
      biometricEnabled: map['biometric_enabled'] as bool? ?? false,
      fcmToken: map['fcm_token'] as String?,
      accountStatus: map['account_status'] as String? ?? 'active',
      createdAt: (map['created_at'] as Timestamp?)?.toDate(),
      updatedAt: (map['updated_at'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'phone': phone,
      'name': name,
      'name_bn': nameBn,
      'email': email,
      'avatar_url': avatarUrl,
      'preferred_language': preferredLanguage,
      'nid_number': nidNumber,
      'nid_verified': nidVerified,
      'wallet_balance': walletBalance,
      'biometric_enabled': biometricEnabled,
      'fcm_token': fcmToken,
      'account_status': accountStatus,
      'created_at': createdAt != null
          ? Timestamp.fromDate(createdAt!)
          : FieldValue.serverTimestamp(),
      'updated_at': FieldValue.serverTimestamp(),
    };
  }

  AppUser copyWith({
    String? name,
    String? nameBn,
    String? preferredLanguage,
    String? avatarUrl,
    bool? biometricEnabled,
    String? fcmToken,
  }) {
    return AppUser(
      uid: uid,
      phone: phone,
      name: name ?? this.name,
      nameBn: nameBn ?? this.nameBn,
      email: email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      preferredLanguage: preferredLanguage ?? this.preferredLanguage,
      nidNumber: nidNumber,
      nidVerified: nidVerified,
      walletBalance: walletBalance,
      biometricEnabled: biometricEnabled ?? this.biometricEnabled,
      fcmToken: fcmToken ?? this.fcmToken,
      accountStatus: accountStatus,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}
