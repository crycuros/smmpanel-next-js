import 'package:flutter/material.dart';

class PaymentScreen extends StatelessWidget {
  final double amount;

  const PaymentScreen({super.key, required this.amount});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
      ),
      body: Center(
        child: Text('Payment: \$$amount'),
      ),
    );
  }
}
