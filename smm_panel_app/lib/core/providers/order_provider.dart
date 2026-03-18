import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/smm_api_service.dart';

class OrderProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService(/*storageService*/);
  final SMMApiService _smmApiService = SMMApiService();

  List<Order> _orders = [];
  Order? _selectedOrder;
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;

  // SMM API status cache
  final Map<int, SMMOrderStatus> _smmStatusCache = {};

  List<Order> get orders => _orders;
  Order? get selectedOrder => _selectedOrder;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMore => _hasMore;
  Map<int, SMMOrderStatus> get smmStatusCache => _smmStatusCache;

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
      
      // After fetching orders, update SMM status for orders that have api_order_id
      _updateSMMStatuses();
    } else {
      _error = response.error;
    }
    notifyListeners();
  }

  // Update SMM statuses for all orders with api_order_id
  Future<void> _updateSMMStatuses() async {
    final ordersWithApiId = _orders
        .where((o) => o.apiOrderId != null && o.apiOrderId!.isNotEmpty)
        .map((o) => int.tryParse(o.apiOrderId!))
        .where((id) => id != null)
        .cast<int>()
        .toList();

    if (ordersWithApiId.isEmpty) return;

    // Get multiple order statuses
    final statuses = await _smmApiService.getMultipleOrderStatus(ordersWithApiId);
    
    _smmStatusCache.addAll(statuses);
    notifyListeners();
  }

  // Check SMM API status for a specific order
  Future<SMMOrderStatus?> checkSMMStatus(String? apiOrderId) async {
    if (apiOrderId == null || apiOrderId.isEmpty) return null;
    
    final orderId = int.tryParse(apiOrderId);
    if (orderId == null) return null;

    final status = await _smmApiService.getOrderStatus(orderId);
    if (status != null) {
      _smmStatusCache[orderId] = status;
      notifyListeners();
    }
    return status;
  }

  // Get cached SMM status for an order
  SMMOrderStatus? getCachedSMMStatus(String? apiOrderId) {
    if (apiOrderId == null) return null;
    final orderId = int.tryParse(apiOrderId);
    if (orderId == null) return null;
    return _smmStatusCache[orderId];
  }

  // Refresh SMM status for a specific order
  Future<void> refreshOrderSMMStatus(Order order) async {
    if (order.apiOrderId == null) return;
    
    final status = await checkSMMStatus(order.apiOrderId);
    if (status != null && _selectedOrder?.id == order.id) {
      // Also update selected order
      _selectedOrder = Order(
        id: order.id,
        orderId: order.orderId,
        userId: order.userId,
        serviceId: order.serviceId,
        serviceName: order.serviceName,
        link: order.link,
        quantity: order.quantity,
        startCount: status.startCount?.toDouble(),
        remains: status.remains?.toDouble(),
        price: order.price,
        status: status.mappedStatus,
        charge: status.charge,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        apiOrderId: order.apiOrderId,
        notes: order.notes,
      );
      notifyListeners();
    }
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
      
      // Also check SMM status if has api_order_id
      if (_selectedOrder?.apiOrderId != null) {
        await refreshOrderSMMStatus(_selectedOrder!);
      }
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
    String? custom_mentions,
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
    _smmStatusCache.clear();
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
