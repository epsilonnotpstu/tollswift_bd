// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'toll_transaction_entity.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

TollTransactionEntity _$TollTransactionEntityFromJson(
    Map<String, dynamic> json) {
  return _TollTransactionEntity.fromJson(json);
}

/// @nodoc
mixin _$TollTransactionEntity {
  String get id => throw _privateConstructorUsedError;
  String get userUid => throw _privateConstructorUsedError;
  String get vehicleReg => throw _privateConstructorUsedError;
  String get bridgeName => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  String get status =>
      throw _privateConstructorUsedError; // success, failed, pending
  DateTime get timestamp => throw _privateConstructorUsedError;

  /// Serializes this TollTransactionEntity to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TollTransactionEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TollTransactionEntityCopyWith<TollTransactionEntity> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TollTransactionEntityCopyWith<$Res> {
  factory $TollTransactionEntityCopyWith(TollTransactionEntity value,
          $Res Function(TollTransactionEntity) then) =
      _$TollTransactionEntityCopyWithImpl<$Res, TollTransactionEntity>;
  @useResult
  $Res call(
      {String id,
      String userUid,
      String vehicleReg,
      String bridgeName,
      double amount,
      String status,
      DateTime timestamp});
}

/// @nodoc
class _$TollTransactionEntityCopyWithImpl<$Res,
        $Val extends TollTransactionEntity>
    implements $TollTransactionEntityCopyWith<$Res> {
  _$TollTransactionEntityCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TollTransactionEntity
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userUid = null,
    Object? vehicleReg = null,
    Object? bridgeName = null,
    Object? amount = null,
    Object? status = null,
    Object? timestamp = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userUid: null == userUid
          ? _value.userUid
          : userUid // ignore: cast_nullable_to_non_nullable
              as String,
      vehicleReg: null == vehicleReg
          ? _value.vehicleReg
          : vehicleReg // ignore: cast_nullable_to_non_nullable
              as String,
      bridgeName: null == bridgeName
          ? _value.bridgeName
          : bridgeName // ignore: cast_nullable_to_non_nullable
              as String,
      amount: null == amount
          ? _value.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as double,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      timestamp: null == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$TollTransactionEntityImplCopyWith<$Res>
    implements $TollTransactionEntityCopyWith<$Res> {
  factory _$$TollTransactionEntityImplCopyWith(
          _$TollTransactionEntityImpl value,
          $Res Function(_$TollTransactionEntityImpl) then) =
      __$$TollTransactionEntityImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String userUid,
      String vehicleReg,
      String bridgeName,
      double amount,
      String status,
      DateTime timestamp});
}

/// @nodoc
class __$$TollTransactionEntityImplCopyWithImpl<$Res>
    extends _$TollTransactionEntityCopyWithImpl<$Res,
        _$TollTransactionEntityImpl>
    implements _$$TollTransactionEntityImplCopyWith<$Res> {
  __$$TollTransactionEntityImplCopyWithImpl(_$TollTransactionEntityImpl _value,
      $Res Function(_$TollTransactionEntityImpl) _then)
      : super(_value, _then);

  /// Create a copy of TollTransactionEntity
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userUid = null,
    Object? vehicleReg = null,
    Object? bridgeName = null,
    Object? amount = null,
    Object? status = null,
    Object? timestamp = null,
  }) {
    return _then(_$TollTransactionEntityImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userUid: null == userUid
          ? _value.userUid
          : userUid // ignore: cast_nullable_to_non_nullable
              as String,
      vehicleReg: null == vehicleReg
          ? _value.vehicleReg
          : vehicleReg // ignore: cast_nullable_to_non_nullable
              as String,
      bridgeName: null == bridgeName
          ? _value.bridgeName
          : bridgeName // ignore: cast_nullable_to_non_nullable
              as String,
      amount: null == amount
          ? _value.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as double,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      timestamp: null == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$TollTransactionEntityImpl implements _TollTransactionEntity {
  const _$TollTransactionEntityImpl(
      {required this.id,
      required this.userUid,
      required this.vehicleReg,
      required this.bridgeName,
      required this.amount,
      required this.status,
      required this.timestamp});

  factory _$TollTransactionEntityImpl.fromJson(Map<String, dynamic> json) =>
      _$$TollTransactionEntityImplFromJson(json);

  @override
  final String id;
  @override
  final String userUid;
  @override
  final String vehicleReg;
  @override
  final String bridgeName;
  @override
  final double amount;
  @override
  final String status;
// success, failed, pending
  @override
  final DateTime timestamp;

  @override
  String toString() {
    return 'TollTransactionEntity(id: $id, userUid: $userUid, vehicleReg: $vehicleReg, bridgeName: $bridgeName, amount: $amount, status: $status, timestamp: $timestamp)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TollTransactionEntityImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userUid, userUid) || other.userUid == userUid) &&
            (identical(other.vehicleReg, vehicleReg) ||
                other.vehicleReg == vehicleReg) &&
            (identical(other.bridgeName, bridgeName) ||
                other.bridgeName == bridgeName) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, userUid, vehicleReg,
      bridgeName, amount, status, timestamp);

  /// Create a copy of TollTransactionEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TollTransactionEntityImplCopyWith<_$TollTransactionEntityImpl>
      get copyWith => __$$TollTransactionEntityImplCopyWithImpl<
          _$TollTransactionEntityImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TollTransactionEntityImplToJson(
      this,
    );
  }
}

abstract class _TollTransactionEntity implements TollTransactionEntity {
  const factory _TollTransactionEntity(
      {required final String id,
      required final String userUid,
      required final String vehicleReg,
      required final String bridgeName,
      required final double amount,
      required final String status,
      required final DateTime timestamp}) = _$TollTransactionEntityImpl;

  factory _TollTransactionEntity.fromJson(Map<String, dynamic> json) =
      _$TollTransactionEntityImpl.fromJson;

  @override
  String get id;
  @override
  String get userUid;
  @override
  String get vehicleReg;
  @override
  String get bridgeName;
  @override
  double get amount;
  @override
  String get status; // success, failed, pending
  @override
  DateTime get timestamp;

  /// Create a copy of TollTransactionEntity
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TollTransactionEntityImplCopyWith<_$TollTransactionEntityImpl>
      get copyWith => throw _privateConstructorUsedError;
}
