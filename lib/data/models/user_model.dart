import 'package:freezed_annotation/freezed_annotation.dart';
part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
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
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
}