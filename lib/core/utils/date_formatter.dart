import 'package:intl/intl.dart';

class DateFormatter {
  static String formatTime(DateTime dateTime, {String language = 'bn'}) {
    final formatter = DateFormat('h:mm a');
    final value = formatter.format(dateTime);
    return language == 'bn' ? _toBanglaDigits(value) : value;
  }

  static String formatShortDate(DateTime dateTime, {String language = 'bn'}) {
    final formatter = DateFormat('d MMM');
    final value = formatter.format(dateTime);
    return language == 'bn' ? _toBanglaDigits(value) : value;
  }

  static String friendlyDate(DateTime dateTime, {String language = 'bn'}) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(dateTime.year, dateTime.month, dateTime.day);
    if (target == today) {
      final prefix = language == 'bn' ? 'আজ' : 'Today';
      return '$prefix, ${formatTime(dateTime, language: language)}';
    }
    return formatShortDate(dateTime, language: language);
  }

  static String _toBanglaDigits(String input) {
    const en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    var out = input;
    for (var i = 0; i < 10; i++) {
      out = out.replaceAll(en[i], bn[i]);
    }
    return out;
  }
}
