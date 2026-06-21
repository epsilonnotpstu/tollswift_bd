import 'package:cloud_firestore/cloud_firestore.dart';

class FamilyMember {
  const FamilyMember({
    required this.uid,
    required this.name,
    required this.phone,
    required this.role,
    required this.joinedAt,
  });

  final String uid;
  final String name;
  final String phone;
  final String role;
  final DateTime? joinedAt;

  factory FamilyMember.fromMap(Map<String, dynamic> map) {
    return FamilyMember(
      uid: map['uid'] as String? ?? '',
      name: map['name'] as String? ?? '',
      phone: map['phone'] as String? ?? '',
      role: map['role'] as String? ?? 'member',
      joinedAt: (map['joined_at'] as Timestamp?)?.toDate(),
    );
  }
}

class FamilyAccountModel {
  const FamilyAccountModel({
    required this.id,
    required this.ownerUid,
    required this.name,
    required this.members,
    required this.sharedWallet,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String ownerUid;
  final String name;
  final List<FamilyMember> members;
  final bool sharedWallet;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  bool isAdmin(String uid) {
    if (uid == ownerUid) return true;
    return members.any((item) => item.uid == uid && item.role == 'admin');
  }

  factory FamilyAccountModel.fromFirestore(
      DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    final membersRaw = (data['members'] as List?)?.cast<dynamic>() ?? const [];
    return FamilyAccountModel(
      id: data['id'] as String? ?? doc.id,
      ownerUid: data['owner_uid'] as String? ?? '',
      name: data['name'] as String? ?? '',
      members: membersRaw
          .map((item) => FamilyMember.fromMap((item as Map).cast<String, dynamic>()))
          .toList(),
      sharedWallet: data['shared_wallet'] as bool? ?? true,
      createdAt: (data['created_at'] as Timestamp?)?.toDate(),
      updatedAt: (data['updated_at'] as Timestamp?)?.toDate(),
    );
  }
}
