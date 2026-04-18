import 'package:flutter/foundation.dart';

class AnalyticsService {
  Future<void> logEvent(String name, {Map<String, Object?>? params}) async {
    debugPrint('Analytics Event: $name, params: $params');
  }
}
