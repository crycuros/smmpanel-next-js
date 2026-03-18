import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'auth_service.dart';
import 'api_service.dart';
import 'storage_service.dart';
import 'notification_service.dart';
import 'payment_service.dart';

class DependencyInjection {
  static final GetIt getIt = GetIt.instance;

  static Future<void> init() async {
    // Initialize Supabase
    await Supabase.initialize(
      url: 'https://zrlawiixikynaviwocgr.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybGF3aWl4aWt5bmF2aXdvY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDc2MTEsImV4cCI6MjA4ODYyMzYxMX0.sD-d6pm-JpI3dfLm6hxVIZkb66KISZhOMMC90cGmkh4',
    );

    // Shared Preferences
    final sharedPreferences = await SharedPreferences.getInstance();
    getIt.registerSingleton<SharedPreferences>(sharedPreferences);

    // Services
    getIt.registerLazySingleton<StorageService>(
      () => StorageService(getIt<SharedPreferences>()),
    );

    getIt.registerLazySingleton<AuthService>(
      () => AuthService(getIt<StorageService>()),
    );

    getIt.registerLazySingleton<ApiService>(
      () => ApiService(getIt<StorageService>()),
    );

    getIt.registerLazySingleton<NotificationService>(
      () => NotificationService(),
    );

    getIt.registerLazySingleton<PaymentService>(
      () => PaymentService(getIt<ApiService>()),
    );
  }
}
