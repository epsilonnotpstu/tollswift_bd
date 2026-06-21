import 'package:flutter_test/flutter_test.dart';
import 'package:tollbd_operator/main.dart';

void main() {
  testWidgets('app boots', (tester) async {
    await tester.pumpWidget(const TollBdOperatorApp());
    expect(find.text('TollBD Operator Login'), findsOneWidget);
  });
}
