import 'api_service.dart';

class PaymentService {
  final ApiService _apiService;

  PaymentService(this._apiService);

  // Payment methods
  static const String methodGCash = 'gcash';
  static const String methodPayPal = 'paypal';
  static const String methodStripe = 'stripe';
  static const String methodBankTransfer = 'bank_transfer';
  static const String methodCrypto = 'crypto';

  // Create payment
  Future<PaymentResult> createPayment({
    required double amount,
    required String method,
    String? description,
  }) async {
    final response = await _apiService.createPayment({
      'amount': amount,
      'method': method,
      'description': description,
    });

    if (response.success && response.data != null) {
      return PaymentResult(
        success: true,
        paymentId: response.data['payment_id'] ?? '',
        qrCode: response.data['qr_code'],
        paymentUrl: response.data['payment_url'],
        instructions: response.data['instructions'],
      );
    }

    return PaymentResult(success: false, error: response.error ?? 'Payment failed');
  }

  // Check payment status
  Future<PaymentStatus> checkPaymentStatus(String paymentId) async {
    final response = await _apiService.getPaymentStatus(paymentId);

    if (response.success && response.data != null) {
      final status = response.data['status'] as String?;
      
      switch (status) {
        case 'completed':
          return PaymentStatus.completed;
        case 'pending':
          return PaymentStatus.pending;
        case 'failed':
          return PaymentStatus.failed;
        case 'cancelled':
          return PaymentStatus.cancelled;
        default:
          return PaymentStatus.unknown;
      }
    }

    return PaymentStatus.unknown;
  }

  // GCash payment
  Future<PaymentResult> createGCashPayment(double amount, String orderId) async {
    return await createPayment(
      amount: amount,
      method: methodGCash,
      description: 'Order: $orderId',
    );
  }

  // PayPal payment
  Future<PaymentResult> createPayPalPayment(double amount, String orderId) async {
    return await createPayment(
      amount: amount,
      method: methodPayPal,
      description: 'Order: $orderId',
    );
  }

  // Stripe payment
  Future<PaymentResult> createStripePayment(double amount, String orderId) async {
    return await createPayment(
      amount: amount,
      method: methodStripe,
      description: 'Order: $orderId',
    );
  }

  // Bank transfer
  Future<PaymentResult> createBankTransferPayment(double amount, String orderId) async {
    return await createPayment(
      amount: amount,
      method: methodBankTransfer,
      description: 'Order: $orderId',
    );
  }

  // Crypto payment
  Future<PaymentResult> createCryptoPayment(double amount, String orderId) async {
    return await createPayment(
      amount: amount,
      method: methodCrypto,
      description: 'Order: $orderId',
    );
  }

  // Get payment methods
  Future<List<PaymentMethod>> getPaymentMethods() async {
    final response = await _apiService.getPaymentMethods();

    if (response.success && response.data != null) {
      final List<dynamic> methods = response.data['methods'] ?? [];
      return methods.map((m) => PaymentMethod.fromJson(m)).toList();
    }

    return [];
  }
}

class PaymentResult {
  final bool success;
  final String? paymentId;
  final String? qrCode;
  final String? paymentUrl;
  final String? instructions;
  final String? error;

  PaymentResult({
    required this.success,
    this.paymentId,
    this.qrCode,
    this.paymentUrl,
    this.instructions,
    this.error,
  });
}

enum PaymentStatus {
  completed,
  pending,
  failed,
  cancelled,
  unknown,
}

class PaymentMethod {
  final String id;
  final String name;
  final String type;
  final String? logo;
  final bool isActive;
  final double? minAmount;
  final double? maxAmount;

  PaymentMethod({
    required this.id,
    required this.name,
    required this.type,
    this.logo,
    this.isActive = true,
    this.minAmount,
    this.maxAmount,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      logo: json['logo'],
      isActive: json['is_active'] ?? true,
      minAmount: json['min_amount']?.toDouble(),
      maxAmount: json['max_amount']?.toDouble(),
    );
  }
}
