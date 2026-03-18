import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/dependency_injection.dart';
import '../../../core/config/theme.dart';

class AdminServicesScreen extends StatefulWidget {
  const AdminServicesScreen({super.key});

  @override
  State<AdminServicesScreen> createState() => _AdminServicesScreenState();
}

class _AdminServicesScreenState extends State<AdminServicesScreen> {
  final ApiService _apiService = DependencyInjection.getIt<ApiService>();
  List<dynamic> _services = [];
  List<dynamic> _categories = [];
  bool _isLoading = true;
  int? _selectedCategory;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final categoriesResponse = await _apiService.getServiceCategories();
      if (categoriesResponse.success) {
        _categories = categoriesResponse.data ?? [];
      }
      
      final servicesResponse = await _apiService.getAllAdminServices(
        categoryId: _selectedCategory,
      );
      if (servicesResponse.success) {
        _services = servicesResponse.data ?? [];
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading data: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Services'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddServiceDialog,
        icon: const Icon(Icons.add),
        label: const Text('Add Service'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Category filter
          if (_categories.isNotEmpty)
            SizedBox(
              height: 50,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: _categories.length + 1,
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: const Text('All'),
                        selected: _selectedCategory == null,
                        onSelected: (selected) {
                          setState(() => _selectedCategory = null);
                          _loadData();
                        },
                      ),
                    );
                  }
                  final category = _categories[index - 1];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(category['name'] ?? ''),
                      selected: _selectedCategory == category['id'],
                      onSelected: (selected) {
                        setState(() => _selectedCategory = selected ? category['id'] : null);
                        _loadData();
                      },
                    ),
                  );
                },
              ),
            ),
          // Services list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _services.isEmpty
                    ? const Center(child: Text('No services found'))
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _services.length,
                          itemBuilder: (context, index) {
                            return _buildServiceCard(_services[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(dynamic service) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        service['name'] ?? 'Service',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        service['category'] ?? 'Uncategorized',
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                _buildStatusBadge(service['status'] ?? 'active'),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildInfoChip('₱${service['price'] ?? 0}', 'Price'),
                const SizedBox(width: 8),
                _buildInfoChip('${service['min_quantity'] ?? 0}', 'Min'),
                const SizedBox(width: 8),
                _buildInfoChip('${service['max_quantity'] ?? 0}', 'Max'),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              service['description'] ?? '',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: () => _showEditServiceDialog(service),
                  icon: const Icon(Icons.edit, size: 18),
                  label: const Text('Edit'),
                ),
                TextButton.icon(
                  onPressed: () => _toggleServiceStatus(service),
                  icon: Icon(
                    service['status'] == 'active' ? Icons.pause : Icons.play_arrow,
                    size: 18,
                  ),
                  label: Text(service['status'] == 'active' ? 'Disable' : 'Enable'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    final isActive = status == 'active';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? AppTheme.successColor.withOpacity(0.1) : Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        isActive ? 'Active' : 'Disabled',
        style: TextStyle(
          color: isActive ? AppTheme.successColor : Colors.red,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildInfoChip(String value, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(width: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  void _showAddServiceDialog() {
    // Show add service dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Service'),
        content: const Text('Service creation form would go here'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showEditServiceDialog(dynamic service) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Service'),
        content: Text('Edit service: ${service['name']}'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Future<void> _toggleServiceStatus(dynamic service) async {
    final newStatus = service['status'] == 'active' ? 'disabled' : 'active';
    try {
      final response = await _apiService.updateService(
        service['id'],
        {'status': newStatus},
      );
      if (response.success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Service ${newStatus} successfully!'),
              backgroundColor: AppTheme.successColor,
            ),
          );
          _loadData();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }
}
