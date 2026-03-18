import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ServiceProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService(/*storageService*/);

  List<Service> _services = [];
  List<ServiceCategory> _categories = [];
  Service? _selectedService;
  bool _isLoading = false;
  String? _error;

  List<Service> get services => _services;
  List<ServiceCategory> get categories => _categories;
  Service? get selectedService => _selectedService;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String searchQuery = '';

  // Get services by category
  List<Service> getServicesByCategory(int categoryId) {
    return _services.where((s) => s.categoryId == categoryId).toList();
  }

  // Fetch services
  Future<void> fetchServices({int? categoryId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.getServices(categoryId: categoryId);

    _isLoading = false;
    if (response.success && response.data != null) {
      final List<dynamic> servicesList = response.data['services'] ?? [];
      _services = servicesList.map((s) => Service.fromJson(s)).toList();
    } else {
      _error = response.error;
    }
    notifyListeners();
  }

  // Fetch categories
  Future<void> fetchCategories() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.getServiceCategories();

    _isLoading = false;
    if (response.success && response.data != null) {
      final List<dynamic> categoriesList = response.data['categories'] ?? [];
      _categories = categoriesList.map((c) => ServiceCategory.fromJson(c)).toList();
    } else {
      _error = response.error;
    }
    notifyListeners();
  }

  // Fetch service details
  Future<Service?> fetchServiceDetails(int serviceId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.getServiceDetails(serviceId);

    _isLoading = false;
    if (response.success && response.data != null) {
      _selectedService = Service.fromJson(response.data);
    } else {
      _error = response.error;
    }
    notifyListeners();

    return _selectedService;
  }

  // Search services
  List<Service> searchServices(String query) {
    final lowercaseQuery = query.toLowerCase();
    return _services.where((s) => 
      s.name.toLowerCase().contains(lowercaseQuery) ||
      s.description.toLowerCase().contains(lowercaseQuery)
    ).toList();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}

class Service {
  final int id;
  final String name;
  final String description;
  final int categoryId;
  final String categoryName;
  final double price;
  final double? minQuantity;
  final double? maxQuantity;
  final String? dripFeed;
  final String? refill;
  final String? cancel;
  final String? averageTime;
  final String? description2;
  final bool isActive;

  Service({
    required this.id,
    required this.name,
    required this.description,
    required this.categoryId,
    required this.categoryName,
    required this.price,
    this.minQuantity,
    this.maxQuantity,
    this.dripFeed,
    this.refill,
    this.cancel,
    this.averageTime,
    this.description2,
    this.isActive = true,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['service_id'] ?? json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      categoryId: json['category_id'] ?? 0,
      categoryName: json['category_name'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      minQuantity: json['min_quantity']?.toDouble(),
      maxQuantity: json['max_quantity']?.toDouble(),
      dripFeed: json['drip_feed'],
      refill: json['refill'],
      cancel: json['cancel'],
      averageTime: json['average_time'],
      description2: json['description_2'],
      isActive: json['status'] != '0',
    );
  }
}

class ServiceCategory {
  final int id;
  final String name;
  final int sort;
  final bool isActive;

  ServiceCategory({
    required this.id,
    required this.name,
    this.sort = 0,
    this.isActive = true,
  });

  factory ServiceCategory.fromJson(Map<String, dynamic> json) {
    return ServiceCategory(
      id: json['category_id'] ?? json['id'] ?? 0,
      name: json['category_name'] ?? json['name'] ?? '',
      sort: json['sort'] ?? 0,
      isActive: json['status'] != '0',
    );
  }
}
