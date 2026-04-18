class Validators {
  static bool isValidBdPhone(String input) {
    final normalized = input.replaceAll(RegExp(r'\D'), '');
    return RegExp(r'^01[3-9]\d{8}$').hasMatch(normalized);
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
          ? 'সঠিক ১০ ডিজিটের নম্বর দিন'
          : 'Enter a valid 10-digit BD number';
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
