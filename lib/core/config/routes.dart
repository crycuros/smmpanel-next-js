import 'package:flutter/material.dart';
import '../../app/splash/splash_screen.dart';
import '../../app/auth/signin/signin_screen.dart';
import '../../app/auth/signup/signup_screen.dart';
import '../../app/auth/verify_otp/verify_otp_screen.dart';
import '../../app/home/home_screen.dart';
import '../../app/dashboard/dashboard_screen.dart';
import '../../app/services/services_screen.dart';
import '../../app/services/service_detail/service_detail_screen.dart';
import '../../app/orders/orders_screen.dart';
import '../../app/orders/order_detail/order_detail_screen.dart';
import '../../app/orders/new_order/new_order_screen.dart';
import '../../app/add_funds/add_funds_screen.dart';
import '../../app/tickets/tickets_screen.dart';
import '../../app/tickets/ticket_detail/ticket_detail_screen.dart';
import '../../app/tickets/new_ticket/new_ticket_screen.dart';
import '../../app/profile/profile_screen.dart';
import '../../app/admin/dashboard/admin_dashboard_screen.dart';
import '../../app/admin/users/admin_users_screen.dart';
import '../../app/admin/services/admin_services_screen.dart';
import '../../app/admin/orders/admin_orders_screen.dart';
import '../../app/admin/add_funds/admin_add_funds_screen.dart';
import '../../app/admin/settings/admin_settings_screen.dart';
import '../../app/admin/tickets/admin_tickets_screen.dart';
import '../../app/payment/payment_screen.dart';
import '../../app/payment/gcash_payment_screen.dart';
import '../../app/payment/payment_success_screen.dart';
import '../../app/payment/payment_failed_screen.dart';
import '../../app/webview/webview_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String signin = '/signin';
  static const String signup = '/signup';
  static const String verifyOtp = '/verify-otp';
  static const String home = '/home';
  static const String dashboard = '/dashboard';
  static const String services = '/services';
  static const String serviceDetail = '/service-detail';
  static const String orders = '/orders';
  static const String orderDetail = '/order-detail';
  static const String newOrder = '/new-order';
  static const String addFunds = '/add-funds';
  static const String tickets = '/tickets';
  static const String ticketDetail = '/ticket-detail';
  static const String newTicket = '/new-ticket';
  static const String profile = '/profile';
  static const String adminDashboard = '/admin';
  static const String adminUsers = '/admin/users';
  static const String adminServices = '/admin/services';
  static const String adminOrders = '/admin/orders';
  static const String adminAddFunds = '/admin/add-funds';
  static const String adminSettings = '/admin/settings';
  static const String adminTickets = '/admin/tickets';
  static const String payment = '/payment';
  static const String gcashPayment = '/gcash-payment';
  static const String paymentSuccess = '/payment-success';
  static const String paymentFailed = '/payment-failed';
  static const String webview = '/webview';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case signin:
        return MaterialPageRoute(builder: (_) => const SignInScreen());
      case signup:
        return MaterialPageRoute(builder: (_) => const SignUpScreen());
      case verifyOtp:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => VerifyOtpScreen(
            email: args['email'] ?? '',
            isSignUp: args['isSignUp'] ?? false,
          ),
        );
      case home:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case dashboard:
        return MaterialPageRoute(builder: (_) => const DashboardScreen());
      case services:
        return MaterialPageRoute(builder: (_) => const ServicesScreen());
      case serviceDetail:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => ServiceDetailScreen(
            serviceId: args['serviceId'] ?? 0,
            serviceName: args['serviceName'] ?? '',
          ),
        );
      case orders:
        return MaterialPageRoute(builder: (_) => const OrdersScreen());
      case orderDetail:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => OrderDetailScreen(
            orderId: args['orderId'] ?? 0,
          ),
        );
      case newOrder:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => NewOrderScreen(
            serviceId: args['serviceId'] ?? 0,
          ),
        );
      case addFunds:
        return MaterialPageRoute(builder: (_) => const AddFundsScreen());
      case tickets:
        return MaterialPageRoute(builder: (_) => const TicketsScreen());
      case ticketDetail:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => TicketDetailScreen(
            ticketId: args['ticketId'] ?? 0,
          ),
        );
      case newTicket:
        return MaterialPageRoute(builder: (_) => const NewTicketScreen());
      case profile:
        return MaterialPageRoute(builder: (_) => const ProfileScreen());
      case adminDashboard:
        return MaterialPageRoute(builder: (_) => const AdminDashboardScreen());
      case adminUsers:
        return MaterialPageRoute(builder: (_) => const AdminUsersScreen());
      case adminServices:
        return MaterialPageRoute(builder: (_) => const AdminServicesScreen());
      case adminOrders:
        return MaterialPageRoute(builder: (_) => const AdminOrdersScreen());
      case adminAddFunds:
        return MaterialPageRoute(builder: (_) => const AdminAddFundsScreen());
      case adminSettings:
        return MaterialPageRoute(builder: (_) => const AdminSettingsScreen());
      case adminTickets:
        return MaterialPageRoute(builder: (_) => const AdminTicketsScreen());
      case payment:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => PaymentScreen(
            amount: args['amount'] ?? 0.0,
          ),
        );
      case gcashPayment:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => GCashPaymentScreen(
            amount: args['amount'] ?? 0.0,
            paymentId: args['paymentId'] ?? '',
          ),
        );
      case paymentSuccess:
        return MaterialPageRoute(builder: (_) => const PaymentSuccessScreen());
      case paymentFailed:
        return MaterialPageRoute(builder: (_) => const PaymentFailedScreen());
      case webview:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => WebViewScreen(
            url: args['url'] ?? '',
            title: args['title'] ?? '',
          ),
        );
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}
