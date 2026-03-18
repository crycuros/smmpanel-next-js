import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/config/routes.dart';
import '../../../core/config/theme.dart';
import '../../../core/providers/order_provider.dart';
import '../../../core/providers/currency_provider.dart';

class NewOrderScreen extends StatefulWidget {
  final int? serviceId;

  const NewOrderScreen({super.key, this.serviceId});

  @override
  State<NewOrderScreen> createState() => _NewOrderScreenState();
}

class _NewOrderScreenState extends State<NewOrderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _linkController = TextEditingController();
  final _quantityController = TextEditingController();
  final _runsController = TextEditingController();
  final _intervalController = TextEditingController();
  
  int? _selectedServiceId;
  double _totalPrice = 0;
  bool _isLoading = false;

  @override
  void dispose() {
    _linkController.dispose();
    _quantityController.dispose();
    _runsController.dispose();
    _intervalController.dispose();
    super.dispose();
  }

  void _calculatePrice() {
    if (_quantityController.text.isEmpty) {
      setState(() {
        _totalPrice = 0;
      });
      return;
    }

    final quantity = double.tryParse(_quantityController.text) ?? 0;
    // Calculate based on service price (placeholder)
    final pricePerUnit = 0.01; // Replace with actual service price
    setState(() {
      _totalPrice = quantity * pricePerUnit;
    });
  }

  Future<void> _placeOrder() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    final orderProvider = context.read<OrderProvider>();
    final order = await orderProvider.createOrder(
      serviceId: _selectedServiceId ?? widget.serviceId ?? 0,
      link: _linkController.text,
      quantity: double.parse(_quantityController.text),
      runs: _runsController.text.isNotEmpty ? _runsController.text : null,
      interval: _intervalController.text.isNotEmpty ? _intervalController.text : null,
    );

    setState(() {
      _isLoading = false;
    });

    if (mounted) {
      if (order != null) {
        Navigator.of(context).pushReplacementNamed(AppRoutes.orders);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Order placed successfully!'),
            backgroundColor: AppTheme.successColor,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(orderProvider.error ?? 'Failed to place order'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyProvider = context.watch<CurrencyProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Order'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Link field
              TextFormField(
                controller: _linkController,
                decoration: const InputDecoration(
                  labelText: 'Link',
                  hintText: 'Enter your post/profile link',
                  prefixIcon: Icon(Icons.link),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a link';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              // Quantity field
              TextFormField(
                controller: _quantityController,
                keyboardType: TextInputType.number,
                onChanged: (_) => _calculatePrice(),
                decoration: const InputDecoration(
                  labelText: 'Quantity',
                  hintText: 'Enter quantity',
                  prefixIcon: Icon(Icons.numbers),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter quantity';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              // Optional fields
              ExpansionTile(
                title: const Text('Advanced Options'),
                children: [
                  TextFormField(
                    controller: _runsController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Runs (for drip feed)',
                      hintText: 'Number of runs',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _intervalController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Interval (minutes)',
                      hintText: 'Interval between runs',
                    ),
                  ),
                ],
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
              // Submit button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _placeOrder,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Place Order'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
