class RouteTollGate {
  const RouteTollGate({
    required this.gateId,
    required this.gateName,
    required this.roadName,
    required this.amount,
    required this.latitude,
    required this.longitude,
  });

  final String gateId;
  final String gateName;
  final String roadName;
  final int amount;
  final double latitude;
  final double longitude;

  factory RouteTollGate.fromMap(Map<String, dynamic> map) {
    final location = (map['location'] as Map?)?.cast<String, dynamic>() ?? const {};
    return RouteTollGate(
      gateId: map['gateId'] as String? ?? '',
      gateName: map['gateName'] as String? ?? '',
      roadName: map['roadName'] as String? ?? '',
      amount: (map['amount'] as num?)?.toInt() ?? 0,
      latitude: (location['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (location['longitude'] as num?)?.toDouble() ?? 0,
    );
  }
}

class RouteEstimateModel {
  const RouteEstimateModel({
    required this.routeFound,
    required this.totalAmount,
    required this.tollsOnRoute,
  });

  final bool routeFound;
  final int totalAmount;
  final List<RouteTollGate> tollsOnRoute;

  factory RouteEstimateModel.fromMap(Map<String, dynamic> map) {
    final rawTolls = (map['tollsOnRoute'] as List?)?.cast<dynamic>() ?? const [];
    return RouteEstimateModel(
      routeFound: map['routeFound'] as bool? ?? true,
      totalAmount: (map['totalAmount'] as num?)?.toInt() ?? 0,
      tollsOnRoute: rawTolls
          .map((item) => RouteTollGate.fromMap((item as Map).cast<String, dynamic>()))
          .toList(),
    );
  }
}
