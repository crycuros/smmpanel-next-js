import 'package:flutter/material.dart';
import '../services/api_service.dart';

class OrderProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService(/*storageService*/);

  List<Order> _orders = [];
  Order? _selectedOrder;
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;

  List<Order> get orders => _orders;
  Order? get selectedOrder => _selectedOrder;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMore => _hasMore;

  // Fetch orders
  Future<void> fetchOrders({String? status, bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _orders = [];
      _hasMore = true;
    }

    if (!_hasMore && !refresh) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.getOrders(status: status, page: _currentPage);

    _isLoading = false;
    if (response.success && response.data != null) {
      final List<dynamic> ordersList = response.data['orders'] ?? [];
      final newOrders = ordersList.map((o) => Order.fromJson(o)).toList();
      
      if (refresh) {
        _orders = newOrders;
      } else {
        _orders.addAll(newOrders);
      }
      
      _hasMore = newOrders.length >= 20;
      _currentPage++;
    } else {
      _error = response.error;
    }
    notifyListeners();
  }

  // Fetch order details
  Future<Order?> fetchOrderDetails(int orderId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.getOrderDetails(orderId);

    _isLoading = false;
    if (response.success && response.data != null) {
      _selectedOrder = Order.fromJson(response.data);
    } else {
      _error = response.error;
    }
    notifyListeners();

    return _selectedOrder;
  }

  // Create order
  Future<Order?> createOrder({
    required int serviceId,
    required String link,
    required double quantity,
    String? runs,
    String? interval,
    String? customComments,
    String? custom mentions,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.createOrder({
      'service_id': serviceId,
      'link': link,
      'quantity': quantity,
      if (runs != null) 'runs': runs,
      if (interval != null) 'interval': interval,
      if (customComments != null) 'custom_comments': customComments,
      if (custom_mentions != null) 'custom_mentions': custom_mentions,
    });

    _isLoading = false;
    if (response.success && response.data != null) {
      final newOrder = Order.fromJson(response.data);
      _orders.insert(0, newOrder);
      notifyListeners();
      return newOrder;
    } else {
      _error = response.error;
      notifyListeners();
      return null;
    }
  }

  // Get orders by status
  List<Order> getOrdersByStatus(String status) {
    return _orders.where((o) => o.status.toLowerCase() == status.toLowerCase()).toList();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Clear orders
  void clearOrders() {
    _orders = [];
    _currentPage = 1;
    _hasMore = true;
    notifyListeners();
  }
}

class Order {
  final int id;
  final String orderId;
  final String? userId;
  final int serviceId;
  final String serviceName;
  final String link;
  final double quantity;
  final double? startCount;
  final double? remains;
  final double price;
  final String status;
  final String? charge;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? apiOrderId;
  final String? notes;

  Order({
    required this.id,
    required this.orderId,
    this.userId,
    required this.serviceId,
    required this.serviceName,
    required this.link,
    required this.quantity,
    this.startCount,
    this.remains,
    required this.price,
    required this.status,
    this.charge,
    this.createdAt,
    this.updatedAt,
    this.apiOrderId,
    this.notes,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? 0,
      orderId: json['order_id'] ?? json['orderID'] ?? '',
      userId: json['user_id'],
      serviceId: json['service_id'] ?? 0,
      serviceName: json['service_name'] ?? '',
      link: json['link'] ?? '',
      quantity: (json['quantity'] ?? 0).toDouble(),
      startCount: json['start_count']?.toDouble(),
      remains: json['remains']?.toDouble(),
      price: (json['price'] ?? 0).toDouble(),
      status: json['status'] ?? 'Pending',
      charge: json['charge'],
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
      updatedAt: json['updated_at'] != null ? DateTime.tryParse(json['updated_at']) : null,
      apiOrderId: json['api_order_id'],
      notes: json['notes'],
    );
  }

  String get statusDisplay {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'partial':
        return 'Partial';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  }
}
