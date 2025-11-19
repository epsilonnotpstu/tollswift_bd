// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'vehicle_entity.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

VehicleEntity _$VehicleEntityFromJson(Map<String, dynamic> json) {
  return _VehicleEntity.fromJson(json);
}

/// @nodoc
mixin _$VehicleEntity {
  String get id => throw _privateConstructorUsedError;
  String get ownerUid => throw _privateConstructorUsedError;
  String get regNumber => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  String get classForToll => throw _privateConstructorUsedError;
  String? get photoUrl => throw _privateConstructorUsedError;
  bool get isDefault => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;

  /// Serializes this VehicleEntity to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of VehicleEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $VehicleEntityCopyWith<VehicleEntity> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $VehicleEntityCopyWith<$Res> {
  factory $VehicleEntityCopyWith(
          VehicleEntity value, $Res Function(VehicleEntity) then) =
      _$VehicleEntityCopyWithImpl<$Res, VehicleEntity>;
  @useResult
  $Res call(
      {String id,
      String ownerUid,
      String regNumber,
      String type,
      String classForToll,
      String? photoUrl,
      bool isDefault,
      DateTime createdAt});
}

/// @nodoc
class _$VehicleEntityCopyWithImpl<$Res, $Val extends VehicleEntity>
    implements $VehicleEntityCopyWith<$Res> {
  _$VehicleEntityCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of VehicleEntity
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerUid = null,
    Object? regNumber = null,
    Object? type = null,
    Object? classForToll = null,
    Object? photoUrl = freezed,
    Object? isDefault = null,
    Object? createdAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      ownerUid: null == ownerUid
          ? _value.ownerUid
          : ownerUid // ignore: cast_nullable_to_non_nullable
              as String,
      regNumber: null == regNumber
          ? _value.regNumber
          : regNumber // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      classForToll: null == classForToll
          ? _value.classForToll
          : classForToll // ignore: cast_nullable_to_non_nullable
              as String,
      photoUrl: freezed == photoUrl
          ? _value.photoUrl
          : photoUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      isDefault: null == isDefault
          ? _value.isDefault
          : isDefault // ignore: cast_nullable_to_non_nullable
              as bool,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$VehicleEntityImplCopyWith<$Res>
    implements $VehicleEntityCopyWith<$Res> {
  factory _$$VehicleEntityImplCopyWith(
          _$VehicleEntityImpl value, $Res Function(_$VehicleEntityImpl) then) =
      __$$VehicleEntityImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String ownerUid,
      String regNumber,
      String type,
      String classForToll,
      String? photoUrl,
      bool isDefault,
      DateTime createdAt});
}

/// @nodoc
class __$$VehicleEntityImplCopyWithImpl<$Res>
    extends _$VehicleEntityCopyWithImpl<$Res, _$VehicleEntityImpl>
    implements _$$VehicleEntityImplCopyWith<$Res> {
  __$$VehicleEntityImplCopyWithImpl(
      _$VehicleEntityImpl _value, $Res Function(_$VehicleEntityImpl) _then)
      : super(_value, _then);

  /// Create a copy of VehicleEntity
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerUid = null,
    Object? regNumber = null,
    Object? type = null,
    Object? classForToll = null,
    Object? photoUrl = freezed,
    Object? isDefault = null,
    Object? createdAt = null,
  }) {
    return _then(_$VehicleEntityImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      ownerUid: null == ownerUid
          ? _value.ownerUid
          : ownerUid // ignore: cast_nullable_to_non_nullable
              as String,
      regNumber: null == regNumber
          ? _value.regNumber
          : regNumber // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      classForToll: null == classForToll
          ? _value.classForToll
          : classForToll // ignore: cast_nullable_to_non_nullable
              as String,
      photoUrl: freezed == photoUrl
          ? _value.photoUrl
          : photoUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      isDefault: null == isDefault
          ? _value.isDefault
          : isDefault // ignore: cast_nullable_to_non_nullable
              as bool,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$VehicleEntityImpl implements _VehicleEntity {
  const _$VehicleEntityImpl(
      {required this.id,
      required this.ownerUid,
      required this.regNumber,
      required this.type,
      required this.classForToll,
      this.photoUrl,
      this.isDefault = false,
      required this.createdAt});

  factory _$VehicleEntityImpl.fromJson(Map<String, dynamic> json) =>
      _$$VehicleEntityImplFromJson(json);

  @override
  final String id;
  @override
  final String ownerUid;
  @override
  final String regNumber;
  @override
  final String type;
  @override
  final String classForToll;
  @override
  final String? photoUrl;
  @override
  @JsonKey()
  final bool isDefault;
  @override
  final DateTime createdAt;

  @override
  String toString() {
    return 'VehicleEntity(id: $id, ownerUid: $ownerUid, regNumber: $regNumber, type: $type, classForToll: $classForToll, photoUrl: $photoUrl, isDefault: $isDefault, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$VehicleEntityImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.ownerUid, ownerUid) ||
                other.ownerUid == ownerUid) &&
            (identical(other.regNumber, regNumber) ||
                other.regNumber == regNumber) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.classForToll, classForToll) ||
                other.classForToll == classForToll) &&
            (identical(other.photoUrl, photoUrl) ||
                other.photoUrl == photoUrl) &&
            (identical(other.isDefault, isDefault) ||
                other.isDefault == isDefault) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, ownerUid, regNumber, type,
      classForToll, photoUrl, isDefault, createdAt);

  /// Create a copy of VehicleEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$VehicleEntityImplCopyWith<_$VehicleEntityImpl> get copyWith =>
      __$$VehicleEntityImplCopyWithImpl<_$VehicleEntityImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$VehicleEntityImplToJson(
      this,
    );
  }
}

abstract class _VehicleEntity implements VehicleEntity {
  const factory _VehicleEntity(
      {required final String id,
      required final String ownerUid,
      required final String regNumber,
      required final String type,
      required final String classForToll,
      final String? photoUrl,
      final bool isDefault,
      required final DateTime createdAt}) = _$VehicleEntityImpl;

  factory _VehicleEntity.fromJson(Map<String, dynamic> json) =
      _$VehicleEntityImpl.fromJson;

  @override
  String get id;
  @override
  String get ownerUid;
  @override
  String get regNumber;
  @override
  String get type;
  @override
  String get classForToll;
  @override
  String? get photoUrl;
  @override
  bool get isDefault;
  @override
  DateTime get createdAt;

  /// Create a copy of VehicleEntity
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$VehicleEntityImplCopyWith<_$VehicleEntityImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
