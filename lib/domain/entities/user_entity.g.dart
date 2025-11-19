// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_entity.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserEntityImpl _$$UserEntityImplFromJson(Map<String, dynamic> json) =>
    _$UserEntityImpl(
      uid: json['uid'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      photoUrl: json['photoUrl'] as String?,
      walletBalance: (json['walletBalance'] as num?)?.toDouble() ?? 0.0,
      isPremium: json['isPremium'] as bool? ?? false,
      premiumUntil: json['premiumUntil'] == null
          ? null
          : DateTime.parse(json['premiumUntil'] as String),
      hasCompletedOnboarding: json['hasCompletedOnboarding'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$UserEntityImplToJson(_$UserEntityImpl instance) =>
    <String, dynamic>{
      'uid': instance.uid,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
      'photoUrl': instance.photoUrl,
      'walletBalance': instance.walletBalance,
      'isPremium': instance.isPremium,
      'premiumUntil': instance.premiumUntil?.toIso8601String(),
      'hasCompletedOnboarding': instance.hasCompletedOnboarding,
      'createdAt': instance.createdAt.toIso8601String(),
    };
