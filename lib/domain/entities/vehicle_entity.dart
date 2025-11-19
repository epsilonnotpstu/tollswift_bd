import 'package:freezed_annotation/freezed_annotation.dart';
part 'vehicle_entity.freezed.dart';
part 'vehicle_entity.g.dart';

@freezed
class VehicleEntity with _$VehicleEntity {
  const factory VehicleEntity({
    required String id,
    required String ownerUid,
    required String regNumber,
    required String type,
    required String classForToll,
    String? photoUrl,
    @Default(false) bool isDefault,
    required DateTime createdAt,
  }) = _VehicleEntity;

  factory VehicleEntity.fromJson(Map<String, dynamic> json) =>
      _$VehicleEntityFromJson(json);
}
