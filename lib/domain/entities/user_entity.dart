import 'package:freezed_annotation/freezed_annotation.dart';
part 'user_entity.freezed.dart';
part 'user_entity.g.dart';

@freezed
class UserEntity with _$UserEntity {
  const factory UserEntity({
    required String uid,
    required String name,
    required String email,
    String? phone,
    String? photoUrl,
    @Default(0.0) double walletBalance,
    @Default(false) bool isPremium,
    DateTime? premiumUntil,
    @Default(false) bool hasCompletedOnboarding,
    required DateTime createdAt,
  }) = _UserEntity;

  factory UserEntity.fromJson(Map<String, dynamic> json) => _$UserEntityFromJson(json);
}