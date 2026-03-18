import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class StorageService {
  final SharedPreferences _prefs;

  // Keys
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _themeKey = 'theme_mode';
  static const String _currencyKey = 'currency';
  static const String _languageKey = 'language';
  static const String _firstLaunchKey = 'first_launch';

  StorageService(this._prefs);

  // Auth Token
  Future<void> saveToken(String token) async {
    await _prefs.setString(_tokenKey, token);
  }

  String? getToken() {
    return _prefs.getString(_tokenKey);
  }

  Future<void> clearToken() async {
    await _prefs.remove(_tokenKey);
  }

  // User Data
  Future<void> saveUser(User user) async {
    await _prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  User? getUser() {
    final userData = _prefs.getString(_userKey);
    if (userData != null) {
      try {
        return User.fromJson(jsonDecode(userData));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  Future<void> clearUser() async {
    await _prefs.remove(_userKey);
    await clearToken();
  }

  // Theme
  Future<void> saveTheme(String theme) async {
    await _prefs.setString(_themeKey, theme);
  }

  String getTheme() {
    return _prefs.getString(_themeKey) ?? 'dark';
  }

  // Currency
  Future<void> saveCurrency(String currency) async {
    await _prefs.setString(_currencyKey, currency);
  }

  String getCurrency() {
    return _prefs.getString(_currencyKey) ?? 'USD';
  }

  // Language
  Future<void> saveLanguage(String language) async {
    await _prefs.setString(_languageKey, language);
  }

  String getLanguage() {
    return _prefs.getString(_languageKey) ?? 'en';
  }

  // First Launch
  Future<void> setFirstLaunch(bool value) async {
    await _prefs.setBool(_firstLaunchKey, value);
  }

  bool isFirstLaunch() {
    return _prefs.getBool(_firstLaunchKey) ?? true;
  }

  // Clear all data
  Future<void> clearAll() async {
    await _prefs.clear();
  }
}
