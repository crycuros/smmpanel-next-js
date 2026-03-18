import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'storage_service.dart';

class AuthService {
  final StorageService _storageService;
  final SupabaseClient _supabase = Supabase.instance;

  AuthService(this._storageService);

  // Sign in with email and password
  Future<AuthResult> signInWithEmail(String email, String password) async {
    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user != null) {
        await _storageService.saveUser(response.user!);
        return AuthResult(success: true, user: response.user);
      }

      return AuthResult(success: false, error: 'Invalid credentials');
    } on AuthException catch (e) {
      return AuthResult(success: false, error: e.message);
    } catch (e) {
      return AuthResult(success: false, error: e.toString());
    }
  }

  // Sign up with email and password
  Future<AuthResult> signUpWithEmail(String email, String password, String name) async {
    try {
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {'name': name},
      );

      if (response.user != null) {
        await _storageService.saveUser(response.user!);
        return AuthResult(success: true, user: response.user);
      }

      return AuthResult(success: false, error: 'Registration failed');
    } on AuthException catch (e) {
      return AuthResult(success: false, error: e.message);
    } catch (e) {
      return AuthResult(success: false, error: e.toString());
    }
  }

  // Sign in with Google
  Future<AuthResult> signInWithGoogle() async {
    try {
      final response = await _supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'smmpanel://login-callback',
      );

      return AuthResult(success: true, user: response.user);
    } on AuthException catch (e) {
      return AuthResult(success: false, error: e.message);
    } catch (e) {
      return AuthResult(success: false, error: e.toString());
    }
  }

  // Sign out
  Future<void> signOut() async {
    await _supabase.auth.signOut();
    await _storageService.clearUser();
  }

  // Get current user
  User? getCurrentUser() {
    return _supabase.auth.currentUser;
  }

  // Check if user is logged in
  bool isLoggedIn() {
    return _supabase.auth.currentUser != null;
  }

  // Reset password
  Future<AuthResult> resetPassword(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(
        email,
        redirectTo: 'smmpanel://reset-password',
      );
      return AuthResult(success: true);
    } on AuthException catch (e) {
      return AuthResult(success: false, error: e.message);
    } catch (e) {
      return AuthResult(success: false, error: e.toString());
    }
  }

  // Update user profile
  Future<AuthResult> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _supabase.auth.updateUser(
        UserAttributes(data: data),
      );

      if (response.user != null) {
        await _storageService.saveUser(response.user!);
        return AuthResult(success: true, user: response.user);
      }

      return AuthResult(success: false, error: 'Update failed');
    } on AuthException catch (e) {
      return AuthResult(success: false, error: e.message);
    } catch (e) {
      return AuthResult(success: false, error: e.toString());
    }
  }

  // Verify OTP
  Future<AuthResult> verifyOTP(String email, String otp) async {
    try {
      final response = await _supabase.auth.verifyOTP(
        email: email,
        token: otp,
        type: OtpType.email,
      );

      if (response.user != null) {
        await _storageService.saveUser(response.user!);
        return AuthResult(success: true, user: response.user);
      }

      return AuthResult(success: false, error: 'Invalid OTP');
    } on AuthException catch (e) {
      return AuthResult(success: false, error: e.message);
    } catch (e) {
      return AuthResult(success: false, error: e.toString());
    }
  }

  // Send OTP
  Future<AuthResult> sendOTP(String email) async {
    try {
      await _supabase.auth.signInWithOtp(
        email: email,
      );
      return AuthResult(success: true);
    } on AuthException catch (e) {
      return AuthResult(success: false, error: e.message);
    } catch (e) {
      return AuthResult(success: false, error: e.toString());
    }
  }

  // Listen to auth changes
  Stream<AuthState> get authStateChanges {
    return _supabase.auth.onAuthStateChange;
  }
}

class AuthResult {
  final bool success;
  final User? user;
  final String? error;

  AuthResult({required this.success, this.user, this.error});
}
