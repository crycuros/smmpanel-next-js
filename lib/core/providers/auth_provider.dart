import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService(StorageService(/*prefs*/));
  
  bool _isLoading = false;
  User? _user;
  String? _error;

  bool get isLoading => _isLoading;
  User? get user => _user;
  String? get error => _error;
  bool get isLoggedIn => _user != null;
  bool get isAdmin => _user?.userMetadata?['admin_type'] == 'admin';

  AuthProvider() {
    _checkCurrentUser();
  }

  void _checkCurrentUser() {
    _user = _authService.getCurrentUser();
    notifyListeners();
  }

  Future<bool> signInWithEmail(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _authService.signInWithEmail(email, password);

    _isLoading = false;
    if (result.success) {
      _user = result.user;
    } else {
      _error = result.error;
    }
    notifyListeners();

    return result.success;
  }

  Future<bool> signUpWithEmail(String email, String password, String name) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _authService.signUpWithEmail(email, password, name);

    _isLoading = false;
    if (result.success) {
      _user = result.user;
    } else {
      _error = result.error;
    }
    notifyListeners();

    return result.success;
  }

  Future<bool> signInWithGoogle() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _authService.signInWithGoogle();

    _isLoading = false;
    if (result.success) {
      _user = result.user;
    } else {
      _error = result.error;
    }
    notifyListeners();

    return result.success;
  }

  Future<void> signOut() async {
    _isLoading = true;
    notifyListeners();

    await _authService.signOut();
    _user = null;

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> resetPassword(String email) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _authService.resetPassword(email);

    _isLoading = false;
    if (!result.success) {
      _error = result.error;
    }
    notifyListeners();

    return result.success;
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _authService.updateProfile(data);

    _isLoading = false;
    if (result.success) {
      _user = result.user;
    } else {
      _error = result.error;
    }
    notifyListeners();

    return result.success;
  }

  Future<bool> verifyOTP(String email, String otp) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _authService.verifyOTP(email, otp);

    _isLoading = false;
    if (result.success) {
      _user = result.user;
    } else {
      _error = result.error;
    }
    notifyListeners();

    return result.success;
  }

  Future<bool> sendOTP(String email) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _authService.sendOTP(email);

    _isLoading = false;
    if (!result.success) {
      _error = result.error;
    }
    notifyListeners();

    return result.success;
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Listen to auth state changes
  void listenToAuthChanges() {
    _authService.authStateChanges.listen((state) {
      _user = state.user;
      notifyListeners();
    });
  }
}
