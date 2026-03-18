import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/config/routes.dart';
import '../../../core/config/theme.dart';
import '../../../core/providers/service_provider.dart';
import '../../../core/providers/currency_provider.dart';

class ServiceDetailScreen extends StatefulWidget {
  final int serviceId;
  final String serviceName;

  const ServiceDetailScreen({
    super.key,
    required this.serviceId,
    required this.serviceName,
  });

  @override
  State<ServiceDetailScreen> createState() => _ServiceDetailScreenState();
}

class _ServiceDetailScreenState extends State<ServiceDetailScreen> {
  Service? _service;
  final _linkController = TextEditingController();
  final _quantityController = TextEditingController();
  double _totalPrice = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadServiceDetails();
  }

  Future<void> _loadServiceDetails() async {
    final serviceProvider = context.read<ServiceProvider>();
    final service = await serviceProvider.fetchServiceDetails(widget.serviceId);

    setState(() {
      _service = service;
      _isLoading = false;
    });
  }

  void _calculatePrice() {
    if (_service == null || _quantityController.text.isEmpty) {
      setState(() {
        _totalPrice = 0;
      });
      return;
    }

    final quantity = double.tryParse(_quantityController.text) ?? 0;
    setState(() {
      _totalPrice = quantity * (_service?.price ?? 0);
    });
  }

  @override
  void dispose() {
    _linkController.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currencyProvider = context.watch<CurrencyProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.serviceName),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _service == null
              ? const Center(child: Text('Service not found'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Service Info Card
                      _buildServiceInfoCard(currencyProvider),
                      const SizedBox(height: 24),
                      // Order Form
                      _buildOrderForm(currencyProvider),
                    ],
                  ),
                ),
    );
  }

  Widget _buildServiceInfoCard(CurrencyProvider currencyProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.bolt,
                    color: AppTheme.primaryColor,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _service!.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _service!.categoryName,
                        style: TextStyle(
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            Text(
              _service!.description,
              style: TextStyle(
                color: Colors.grey.shade700,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 16),
            // Service features
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildFeatureChip(
                  'Min: ${_service!.minQuantity?.toInt() ?? 0}',
                  Icons.shopping_bag_outlined,
                ),
                _buildFeatureChip(
                  'Max: ${_service!.maxQuantity?.toInt() ?? 0}',
                  Icons.inventory_2_outlined,
                ),
                _buildFeatureChip(
                  _service!.averageTime ?? 'N/A',
                  Icons.timer_outlined,
                ),
                if (_service!.refill == '1')
                  _buildFeatureChip('Refill Available', Icons.refresh),
                if (_service!.dripFeed == '1')
                  _buildFeatureChip('Drip Feed', Icons.water_drop_outlined),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureChip(String label, IconData icon) {
    return Chip(
      avatar: Icon(icon, size: 16),
      label: Text(label),
      backgroundColor: Theme.of(context).cardColor,
    );
  }

  Widget _buildOrderForm(CurrencyProvider currencyProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Place Order',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _linkController,
              decoration: const InputDecoration(
                labelText: 'Link',
                hintText: 'Enter your post/profile link',
                prefixIcon: Icon(Icons.link),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _quantityController,
              keyboardType: TextInputType.number,
              onChanged: (_) => _calculatePrice(),
              decoration: const InputDecoration(
                labelText: 'Quantity',
                hintText: 'Enter quantity',
                prefixIcon: Icon(Icons.numbers),
              ),
            ),
            const SizedBox(height: 24),
            // Price calculation
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total Price',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    currencyProvider.formatCurrency(_totalPrice),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _totalPrice > 0 ? _placeOrder : null,
                child: const Text('Place Order'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _placeOrder() async {
    if (_linkController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a link'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
      return;
    }

    if (_quantityController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter quantity'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
      return;
    }

    // Navigate to new order screen with parameters
    Navigator.of(context).pushNamed(
      AppRoutes.newOrder,
      arguments: {
        'serviceId': widget.serviceId,
        'link': _linkController.text,
        'quantity': double.parse(_quantityController.text),
      },
    );
  }
}
