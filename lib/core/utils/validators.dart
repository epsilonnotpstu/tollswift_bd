class Validators {
  static String? normalizeBdPhone(String input) {
    var normalized = input.replaceAll(RegExp(r'\D'), '');
    if (normalized.startsWith('880')) {
      normalized = normalized.substring(3);
    }
    if (normalized.startsWith('0')) {
      normalized = normalized.substring(1);
    }
    if (RegExp(r'^1[3-9]\d{8}$').hasMatch(normalized)) {
      return normalized;
    }
    return null;
  }

  static bool isValidBdPhone(String input) {
    return normalizeBdPhone(input) != null;
  }

  static String? toBdE164(String input) {
    final localNumber = normalizeBdPhone(input);
    if (localNumber == null) return null;
    return '+880$localNumber';
  }

  static String? phoneValidationMessage(
    String input, {
    String language = 'bn',
  }) {
    if (input.isEmpty) {
      return language == 'bn' ? 'নম্বর দিন' : 'Enter phone number';
    }
    if (!isValidBdPhone(input)) {
      return language == 'bn'
          ? 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)'
          : 'Enter a valid BD mobile number (01XXXXXXXXX)';
    }
    return null;
  }

  static String maskPhone(String phone) {
    if (phone.length < 8) return phone;
    final prefix = phone.substring(0, 7);
    final suffix = phone.substring(phone.length - 4);
    return '$prefix***$suffix';
  }

  static String? validateAmount(num amount, {String language = 'bn'}) {
    if (amount < 50) return language == 'bn' ? 'সর্বনিম্ন ৳50' : 'Minimum ৳50';
    if (amount > 50000) {
      return language == 'bn' ? 'সর্বোচ্চ ৳50,000' : 'Maximum ৳50,000';
    }
    return null;
  }
}
