class TripModel {
  const TripModel({
    required this.id,
    required this.type,
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.status,
    required this.createdAt,
    this.vehicleId,
    this.vehiclePlate,
    this.gateId,
    this.paymentId,
  });

  final String id;
  final String type;
  final String title;
  final String subtitle;
  final int amount;
  final String status;
  final DateTime createdAt;
  final String? vehicleId;
  final String? vehiclePlate;
  final String? gateId;
  final String? paymentId;

  bool get isCredit => amount >= 0;
}
