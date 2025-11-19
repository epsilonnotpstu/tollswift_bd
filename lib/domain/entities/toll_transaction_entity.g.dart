// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'toll_transaction_entity.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TollTransactionEntityImpl _$$TollTransactionEntityImplFromJson(
        Map<String, dynamic> json) =>
    _$TollTransactionEntityImpl(
      id: json['id'] as String,
      userUid: json['userUid'] as String,
      vehicleReg: json['vehicleReg'] as String,
      bridgeName: json['bridgeName'] as String,
      amount: (json['amount'] as num).toDouble(),
      status: json['status'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );

Map<String, dynamic> _$$TollTransactionEntityImplToJson(
        _$TollTransactionEntityImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userUid': instance.userUid,
      'vehicleReg': instance.vehicleReg,
      'bridgeName': instance.bridgeName,
      'amount': instance.amount,
      'status': instance.status,
      'timestamp': instance.timestamp.toIso8601String(),
    };
