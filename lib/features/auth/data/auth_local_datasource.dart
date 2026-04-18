import 'package:shared_preferences/shared_preferences.dart';

class AuthLocalDatasource {
  AuthLocalDatasource(this._prefs);

  final SharedPreferences _prefs;

  static const _languageKey = 'preferred_language';
  static const _biometricKey = 'biometric_enabled';
  static const _hideBalanceKey = 'hide_balance';

  String getPreferredLanguage() => _prefs.getString(_languageKey) ?? 'bn';

  Future<void> setPreferredLanguage(String language) async {
    await _prefs.setString(_languageKey, language);
  }

  bool getBiometricEnabled() => _prefs.getBool(_biometricKey) ?? false;

  Future<void> setBiometricEnabled(bool enabled) async {
    await _prefs.setBool(_biometricKey, enabled);
  }

  bool getHideBalance() => _prefs.getBool(_hideBalanceKey) ?? false;

  Future<void> setHideBalance(bool hidden) async {
    await _prefs.setBool(_hideBalanceKey, hidden);
  }
}
