import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/config/routes.dart';
import '../../core/config/theme.dart';
import '../../core/providers/currency_provider.dart';

class AddFundsScreen extends StatefulWidget {
  const AddFundsScreen({super.key});

  @override
  State<AddFundsScreen> createState() => _AddFundsScreenState();
}

class _AddFundsScreenState extends State<AddFundsScreen> {
  final _amountController = TextEditingController();
  String _selectedPaymentMethod = 'gcash';
  bool _isLoading = false;

  final List<Map<String, dynamic>> _paymentMethods = [
    {'id': 'gcash', 'name': 'GCash', 'icon': Icons.qr_code, 'color': const Color(0xFF0057D8)},
    {'id': 'paypal', 'name': 'PayPal', 'icon': Icons.payment, 'color': const Color(0xFF003087)},
    {'id': 'stripe', 'name': 'Credit Card', 'icon': Icons.credit_card, 'color': const Color(0xFF635BFF)},
    {'id': 'bank', 'name': 'Bank Transfer', 'icon': Icons.account_balance, 'color': const Color(0xFF4CAF50)},
  ];

  final List<double> _quickAmounts = [10, 25, 50, 100, 250, 500];

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _handlePayment() async {
    if (_amountController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter an amount'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
      return;
    }

    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid amount'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    // Simulate payment creation
    await Future.delayed(const Duration(seconds: 1));

    setState(() {
      _isLoading = false;
    });

    if (mounted) {
      // Navigate based on payment method
      if (_selectedPaymentMethod == 'gcash') {
        Navigator.of(context).pushNamed(
          AppRoutes.gcashPayment,
          arguments: {
            'amount': amount,
            'paymentId': 'PAY${DateTime.now().millisecondsSinceEpoch}',
          },
        );
      } else {
        Navigator.of(context).pushNamed(
          AppRoutes.payment,
          arguments: {'amount': amount},
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyProvider = context.watch<CurrencyProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Funds'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Current balance card
            _buildBalanceCard(currencyProvider),
            const SizedBox(height: 24),
            // Quick amounts
            const Text(
              'Quick Amounts',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: _quickAmounts.map((amount) {
                return InkWell(
                  onTap: () {
                    _amountController.text = amount.toString();
                    setState(() {});
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: _amountController.text == amount.toString()
                            ? AppTheme.primaryColor
                            : Colors.grey.shade300,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      color: _amountController.text == amount.toString()
                          ? AppTheme.primaryColor.withOpacity(0.1)
                          : null,
                    ),
                    child: Text(
                      currencyProvider.formatCurrency(amount),
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: _amountController.text == amount.toString()
                            ? AppTheme.primaryColor
                            : null,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            // Custom amount
            const Text(
              'Or Enter Custom Amount',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                labelText: 'Amount',
                hintText: 'Enter amount',
                prefixIcon: const Icon(Icons.attach_money),
                prefixText: currencyProvider.currencySymbol,
              ),
            ),
            const SizedBox(height: 24),
            // Payment methods
            const Text(
              'Payment Method',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            ..._paymentMethods.map((method) {
              final isSelected = _selectedPaymentMethod == method['id'];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _selectedPaymentMethod = method['id'];
                    });
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: (method['color'] as Color).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            method['icon'] as IconData,
                            color: method['color'] as Color,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            method['name'] as String,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        if (isSelected)
                          const Icon(
                            Icons.check_circle,
                            color: AppTheme.primaryColor,
                          ),
                      ],
                    ),
                  ),
                ),
              );
            }),
            const SizedBox(height: 24),
            // Submit button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handlePayment,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text('Proceed to Payment'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard(CurrencyProvider currencyProvider) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Current Balance',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            currencyProvider.formatCurrency(150.00), // Replace with actual balance
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
