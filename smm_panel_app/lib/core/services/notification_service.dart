import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    await Firebase.initializeApp();
    
    // Request permission
    final settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('Notification permission granted');
    } else if (settings.authorizationStatus == AuthorizationStatus.provisional) {
      print('Notification provisional permission granted');
    } else {
      print('Notification permission denied');
    }

    // Get token
    final token = await _firebaseMessaging.getToken();
    print('FCM Token: $token');

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleMessage);

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);
  }

  void _handleMessage(RemoteMessage message) {
    print('Received foreground message: ${message.notification?.title}');
    print('Body: ${message.notification?.body}');
    
    // Show local notification
    _showNotification(
      title: message.notification?.title ?? 'SMM Panel',
      body: message.notification?.body ?? '',
      data: message.data,
    );
  }

  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    print('Received background message: ${message.notification?.title}');
    print('Body: ${message.notification?.body}');
  }

  Future<void> _showNotification({
    required String title,
    required String body,
    Map<String, dynamic>? data,
  }) async {
    // You can use flutter_local_notifications package here
    // For now, we'll just print the notification
    print('Showing notification: $title - $body');
  }

  // Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }

  // Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }

  // Get FCM token
  Future<String?> getToken() async {
    return await _firebaseMessaging.getToken();
  }

  // Delete token
  Future<void> deleteToken() async {
    await _firebaseMessaging.deleteToken();
  }
}
