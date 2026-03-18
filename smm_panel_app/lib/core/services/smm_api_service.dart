import 'dart:convert';
import 'package:http/http.dart' as http;

/// SMM API Service for weboostph.biz
/// Documentation:
/// - Order status: POST with key, action=status, order=OrderID
/// - Multiple orders: POST with key, action=status, orders=comma-separated IDs
/// - Response: charge, start_count, status, remains, currency
class SMMApiService {
  static const String _baseUrl = 'https://weboostph.biz/api/v2';
  static const String _apiKey = 'ba0bdd77f025b1fc19b321ecaf0acf67';

  /// Check single order status
  /// Returns: {charge, start_count, status, remains, currency}
  Future<SMMOrderStatus?> getOrderStatus(int orderId) async {
    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        body: {
          'key': _apiKey,
          'action': 'status',
          'order': orderId.toString(),
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        // Check for error
        if (data.containsKey('error')) {
          print('SMM API Error: ${data['error']}');
          return null;
        }

        return SMMOrderStatus.fromJson(data);
      }
    } catch (e) {
      print('SMM API Exception: $e');
    }
    return null;
  }

  /// Check multiple orders status (up to 100 IDs)
  /// Returns: Map of orderId -> SMMOrderStatus
  Future<Map<int, SMMOrderStatus?>> getMultipleOrderStatus(List<int> orderIds) async {
    if (orderIds.isEmpty || orderIds.length > 100) {
      return {};
    }

    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        body: {
          'key': _apiKey,
          'action': 'status',
          'orders': orderIds.join(','),
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final result = <int, SMMOrderStatus?>{};

        for (var entry in data.entries) {
          final orderId = int.tryParse(entry.key);
          if (orderId != null) {
            if (entry.value is Map && !(entry.value as Map).containsKey('error')) {
              result[orderId] = SMMOrderStatus.fromJson(entry.value);
            } else {
              result[orderId] = null;
            }
          }
        }

        return result;
      }
    } catch (e) {
      print('SMM API Exception: $e');
    }
    return {};
  }

  /// Get user balance
  Future<double?> getBalance() async {
    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        body: {
          'key': _apiKey,
          'action': 'balance',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data.containsKey('balance')) {
          return double.tryParse(data['balance'].toString());
        }
      }
    } catch (e) {
      print('SMM API Exception: $e');
    }
    return null;
  }

  /// Get service list
  Future<List<SMMService>?> getServices() async {
    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        body: {
          'key': _apiKey,
          'action': 'services',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          return data.map((s) => SMMService.fromJson(s)).toList();
        }
      }
    } catch (e) {
      print('SMM API Exception: $e');
    }
    return null;
  }

  /// Create refill request
  Future<int?> createRefill(int orderId) async {
    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        body: {
          'key': _apiKey,
          'action': 'refill',
          'order': orderId.toString(),
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data.containsKey('refill')) {
          return int.tryParse(data['refill'].toString());
        }
      }
    } catch (e) {
      print('SMM API Exception: $e');
    }
    return null;
  }

  /// Get refill status
  Future<String?> getRefillStatus(int refillId) async {
    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        body: {
          'key': _apiKey,
          'action': 'refill_status',
          'refill': refillId.toString(),
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['status'];
      }
    } catch (e) {
      print('SMM API Exception: $e');
    }
    return null;
  }
}

/// Order status model from SMM API
class SMMOrderStatus {
  final String? charge;
  final int? startCount;
  final String status;
  final int? remains;
  final String? currency;

  SMMOrderStatus({
    this.charge,
    this.startCount,
    required this.status,
    this.remains,
    this.currency,
  });

  factory SMMOrderStatus.fromJson(Map<String, dynamic> json) {
    return SMMOrderStatus(
      charge: json['charge']?.toString(),
      startCount: int.tryParse(json['start_count']?.toString() ?? ''),
      status: json['status']?.toString() ?? 'Unknown',
      remains: int.tryParse(json['remains']?.toString() ?? ''),
      currency: json['currency']?.toString(),
    );
  }

  /// Map SMM API status to our app status
  String get mappedStatus {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'processing':
      case 'in progress':
        return 'processing';
      case 'completed':
        return 'completed';
      case 'partial':
        return 'partial';
      case 'cancelled':
      case 'cancel':
        return 'cancelled';
      case 'refunded':
        return 'refunded';
      default:
        return 'pending';
    }
  }
}

/// SMM Service model
class SMMService {
  final int service;
  final String name;
  final String type;
  final String category;
  final String rate;
  final int min;
  final int max;
  final bool refill;
  final bool cancel;

  SMMService({
    required this.service,
    required this.name,
    required this.type,
    required this.category,
    required this.rate,
    required this.min,
    required this.max,
    required this.refill,
    required this.cancel,
  });

  factory SMMService.fromJson(Map<String, dynamic> json) {
    return SMMService(
      service: json['service'] ?? 0,
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      category: json['category'] ?? '',
      rate: json['rate'] ?? '0',
      min: int.tryParse(json['min']?.toString() ?? '0') ?? 0,
      max: int.tryParse(json['max']?.toString() ?? '0') ?? 0,
      refill: json['refill'] ?? false,
      cancel: json['cancel'] ?? false,
    );
  }
}
