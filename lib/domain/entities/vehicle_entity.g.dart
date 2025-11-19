// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_entity.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$VehicleEntityImpl _$$VehicleEntityImplFromJson(Map<String, dynamic> json) =>
    _$VehicleEntityImpl(
      id: json['id'] as String,
      ownerUid: json['ownerUid'] as String,
      regNumber: json['regNumber'] as String,
      type: json['type'] as String,
      classForToll: json['classForToll'] as String,
      photoUrl: json['photoUrl'] as String?,
      isDefault: json['isDefault'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$VehicleEntityImplToJson(_$VehicleEntityImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'ownerUid': instance.ownerUid,
      'regNumber': instance.regNumber,
      'type': instance.type,
      'classForToll': instance.classForToll,
      'photoUrl': instance.photoUrl,
      'isDefault': instance.isDefault,
      'createdAt': instance.createdAt.toIso8601String(),
    };
