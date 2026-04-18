import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _bdt = NumberFormat.currency(
    locale: 'en_US',
    decimalDigits: 2,
    symbol: '৳',
  );

  static String formatPaisa(int paisa, {bool withSymbol = true}) {
    final taka = paisa / 100;
    if (!withSymbol) {
      return NumberFormat('#,##0.00').format(taka);
    }
    return _bdt.format(taka);
  }

  static int takaToPaisa(num taka) => (taka * 100).round();
}
