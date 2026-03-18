import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'core/config/theme.dart';
import 'core/config/routes.dart';
import 'core/services/dependency_injection.dart';
import 'core/services/auth_service.dart';
import 'core/services/api_service.dart';
import 'core/services/storage_service.dart';
import 'core/services/notification_service.dart';
import 'core/services/payment_service.dart';
import 'core/providers/theme_provider.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/currency_provider.dart';
import 'core/providers/service_provider.dart';
import 'core/providers/order_provider.dart';
import 'core/providers/ticket_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  
  // Initialize services
  await DependencyInjection.init();
  
  // Load saved theme
  final prefs = await SharedPreferences.getInstance();
  final themeMode = prefs.getString('theme_mode') ?? 'dark';
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => ThemeProvider(themeMode),
        ),
        ChangeNotifierProvider(
          create: (_) => AuthProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => CurrencyProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => ServiceProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => OrderProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => TicketProvider(),
        ),
      ],
      child: const SMMPanelApp(),
    ),
  );
}

class SMMPanelApp extends StatelessWidget {
  const SMMPanelApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'SMM Panel',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: themeProvider.themeMode,
          initialRoute: AppRoutes.splash,
          onGenerateRoute: AppRoutes.generateRoute,
        );
      },
    );
  }
}
