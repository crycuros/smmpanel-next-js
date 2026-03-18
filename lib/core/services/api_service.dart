import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';

class ApiService {
  final StorageService _storageService;
  final String _baseUrl = 'https://smmpanelnextjs.vercel.app'; // Vercel deployment URL

  ApiService(this._storageService);

  Map<String, String> get _headers {
    final token = _storageService.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // GET request
  Future<ApiResponse> get(String endpoint, {Map<String, String>? queryParams}) async {
    try {
      Uri uri = Uri.parse('$_baseUrl$endpoint');
      if (queryParams != null) {
        uri = uri.replace(queryParameters: queryParams);
      }

      final response = await http.get(uri, headers: _headers);
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  // POST request
  Future<ApiResponse> post(String endpoint, {Map<String, dynamic>? body}) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl$endpoint'),
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  // PUT request
  Future<ApiResponse> put(String endpoint, {Map<String, dynamic>? body}) async {
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl$endpoint'),
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  // DELETE request
  Future<ApiResponse> delete(String endpoint) async {
    try {
      final response = await http.delete(
        Uri.parse('$_baseUrl$endpoint'),
        headers: _headers,
      );
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  ApiResponse _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        final data = jsonDecode(response.body);
        return ApiResponse(success: true, data: data);
      } catch (e) {
        return ApiResponse(success: true, data: response.body);
      }
    } else {
      String errorMessage = 'An error occurred';
      try {
        final data = jsonDecode(response.body);
        errorMessage = data['message'] ?? data['error'] ?? errorMessage;
      } catch (e) {
        errorMessage = response.reasonPhrase ?? errorMessage;
      }
      return ApiResponse(success: false, error: errorMessage, statusCode: response.statusCode);
    }
  }

  // ==================== User API ====================
  
  // Get user profile
  Future<ApiResponse> getUserProfile() async {
    return await get('/api/user/profile');
  }

  // Update user profile
  Future<ApiResponse> updateUserProfile(Map<String, dynamic> data) async {
    return await put('/api/user/profile', body: data);
  }

  // Get user balance
  Future<ApiResponse> getUserBalance() async {
    return await get('/api/user/balance');
  }

  // ==================== Services API ====================

  // Get all services
  Future<ApiResponse> getServices({int? categoryId}) async {
    final queryParams = categoryId != null ? {'category_id': categoryId.toString()} : null;
    return await get('/api/services', queryParams: queryParams);
  }

  // Get service categories
  Future<ApiResponse> getServiceCategories() async {
    return await get('/api/services/categories');
  }

  // Get service details
  Future<ApiResponse> getServiceDetails(int serviceId) async {
    return await get('/api/services/$serviceId');
  }

  // ==================== Orders API ====================

  // Get user orders
  Future<ApiResponse> getOrders({String? status, int page = 1}) async {
    final queryParams = {
      'page': page.toString(),
      if (status != null) 'status': status,
    };
    return await get('/api/orders', queryParams: queryParams);
  }

  // Get order details
  Future<ApiResponse> getOrderDetails(int orderId) async {
    return await get('/api/orders/$orderId');
  }

  // Create new order
  Future<ApiResponse> createOrder(Map<String, dynamic> orderData) async {
    return await post('/api/orders', body: orderData);
  }

  // ==================== Funds API ====================

  // Get payment methods
  Future<ApiResponse> getPaymentMethods() async {
    return await get('/api/payment/methods');
  }

  // Create payment
  Future<ApiResponse> createPayment(Map<String, dynamic> paymentData) async {
    return await post('/api/payment/create', body: paymentData);
  }

  // Get payment status
  Future<ApiResponse> getPaymentStatus(String paymentId) async {
    return await get('/api/payment/$paymentId/status');
  }

  // Add funds
  Future<ApiResponse> addFunds(double amount, String paymentMethod) async {
    return await post('/api/funds/add', body: {
      'amount': amount,
      'payment_method': paymentMethod,
    });
  }

  // ==================== Tickets API ====================

  // Get tickets
  Future<ApiResponse> getTickets({String? status}) async {
    final queryParams = status != null ? {'status': status} : null;
    return await get('/api/tickets', queryParams: queryParams);
  }

  // Get ticket details
  Future<ApiResponse> getTicketDetails(int ticketId) async {
    return await get('/api/tickets/$ticketId');
  }

  // Create ticket
  Future<ApiResponse> createTicket(Map<String, dynamic> ticketData) async {
    return await post('/api/tickets', body: ticketData);
  }

  // Reply to ticket
  Future<ApiResponse> replyToTicket(int ticketId, String message) async {
    return await post('/api/tickets/$ticketId/reply', body: {'message': message});
  }

  // ==================== Admin API ====================

  // Get all users (admin)
  Future<ApiResponse> getAllUsers({int page = 1}) async {
    return await get('/api/admin/users', queryParams: {'page': page.toString()});
  }

  // Get user details (admin)
  Future<ApiResponse> getUserDetails(int userId) async {
    return await get('/api/admin/users/$userId');
  }

  // Update user (admin)
  Future<ApiResponse> updateUser(int userId, Map<String, dynamic> data) async {
    return await put('/api/admin/users/$userId', body: data);
  }

  // Add funds to user (admin)
  Future<ApiResponse> addFundsToUser(int userId, double amount) async {
    return await post('/api/admin/users/$userId/add-funds', body: {'amount': amount});
  }

  // Get all orders (admin)
  Future<ApiResponse> getAllOrders({String? status, int page = 1}) async {
    final queryParams = {
      'page': page.toString(),
      if (status != null) 'status': status,
    };
    return await get('/api/admin/orders', queryParams: queryParams);
  }

  // Update order status (admin)
  Future<ApiResponse> updateOrderStatus(int orderId, String status) async {
    return await put('/api/admin/orders/$orderId', body: {'status': status});
  }

  // Get all services (admin)
  Future<ApiResponse> getAllAdminServices({int? categoryId}) async {
    final queryParams = categoryId != null ? {'category_id': categoryId.toString()} : null;
    return await get('/api/admin/services', queryParams: queryParams);
  }

  // Create service (admin)
  Future<ApiResponse> createService(Map<String, dynamic> serviceData) async {
    return await post('/api/admin/services', body: serviceData);
  }

  // Update service (admin)
  Future<ApiResponse> updateService(int serviceId, Map<String, dynamic> data) async {
    return await put('/api/admin/services/$serviceId', body: data);
  }

  // Delete service (admin)
  Future<ApiResponse> deleteService(int serviceId) async {
    return await delete('/api/admin/services/$serviceId');
  }

  // Get all tickets (admin)
  Future<ApiResponse> getAllAdminTickets({String? status}) async {
    final queryParams = status != null ? {'status': status} : null;
    return await get('/api/admin/tickets', queryParams: queryParams);
  }

  // Reply to ticket (admin)
  Future<ApiResponse> adminReplyToTicket(int ticketId, String message) async {
    return await post('/api/admin/tickets/$ticketId/reply', body: {'message': message});
  }

  // Get dashboard stats (admin)
  Future<ApiResponse> getDashboardStats() async {
    return await get('/api/admin/dashboard/stats');
  }

  // Get settings (admin)
  Future<ApiResponse> getSettings() async {
    return await get('/api/admin/settings');
  }

  // Update settings (admin)
  Future<ApiResponse> updateSettings(Map<String, dynamic> settings) async {
    return await put('/api/admin/settings', body: settings);
  }
}

class ApiResponse {
  final bool success;
  final dynamic data;
  final String? error;
  final int? statusCode;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.statusCode,
  });
}
