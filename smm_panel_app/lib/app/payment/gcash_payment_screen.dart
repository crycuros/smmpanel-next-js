import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/config/routes.dart';
import '../../core/config/theme.dart';
import '../../core/providers/currency_provider.dart';

class GCashPaymentScreen extends StatefulWidget {
  final double amount;
  final String paymentId;

  const GCashPaymentScreen({
    super.key,
    required this.amount,
    required this.paymentId,
  });

  @override
  State<GCashPaymentScreen> createState() => _GCashPaymentScreenState();
}

class _GCashPaymentScreenState extends State<GCashPaymentScreen> {
  Timer? _timer;
  int _countdown = 300; // 5 minutes
  bool _isProcessing = false;

  // GCash details from settings
  static const String _gcashNumber = '09565082558';
  static const String _gcashName = 'MND SMM';

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  // CRC16 (EMV) for GCash QR
  String _crc16(String str) {
    int crc = 0xFFFF;
    for (int i = 0; i < str.length; i++) {
      crc ^= str.codeUnitAt(i) << 8;
      for (int j = 0; j < 8; j++) {
        if ((crc & 0x8000) != 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
      }
    }
    crc &= 0xFFFF;
    return crc.toRadixString(16).toUpperCase().padLeft(4, '0');
  }

  // Generate GCash QR payload (EMVCo QR PH format)
  String _generateGCashPayload(double amount) {
    // Static QR format (without amount - field 11 for test)
    // For dynamic QR with amount:
    String payload = '00020101021227830012com.p2pqrpay0111GXCHPHM2XXX02089996440303152170200000006560417DWQM4TK3JDO3I2X77520460165303608';
    
    // Add amount field (54) if amount > 0
    if (amount > 0) {
      final amountStr = amount.toStringAsFixed(2);
      // Length is the actual length of the amount string, NOT padded
      final len = amountStr.length.toString();
      payload += '54$len$amountStr';
    }
    
    // Merchant info
    payload += '5802PH5909$_gcashName6010Manila6104$_gcashNumber82558';
    
    // Add CRC at the end
    final crc = _crc16(payload + '6304');
    return payload + '6304' + crc;
  }

  void _startCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        setState(() {
          _countdown--;
        });
      } else {
        timer.cancel();
        if (mounted) {
          _showTimeoutDialog();
        }
      }
    });
  }

  void _showTimeoutDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Payment Timeout'),
        content: const Text('The payment session has expired. Please try again.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _checkPaymentStatus() async {
    setState(() {
      _isProcessing = true;
    });

    // Simulate checking payment status
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _isProcessing = false;
    });

    if (mounted) {
      // Navigate to success screen
      Navigator.of(context).pushReplacementNamed(AppRoutes.paymentSuccess);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final currencyProvider = context.watch<CurrencyProvider>();
    final qrPayload = _generateGCashPayload(widget.amount);

    return Scaffold(
      appBar: AppBar(
        title: const Text('GCash Payment'),
        backgroundColor: const Color(0xFF0057D8),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // GCash Logo
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFF0057D8).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(
                Icons.qr_code,
                size: 40,
                color: Color(0xFF0057D8),
              ),
            ),
            const SizedBox(height: 24),
            // Amount
            Text(
              currencyProvider.formatCurrency(widget.amount),
              style: const TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Payment ID: ${widget.paymentId}',
              style: TextStyle(
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            // QR Code
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: [
                  QrImageView(
                    data: qrPayload,
                    version: QrVersions.auto,
                    size: 200.0,
                    backgroundColor: Colors.white,
                    errorCorrectionLevel: QrErrorCorrectLevel.M,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Scan QR Code with GCash',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Payment details
            Card(
              color: const Color(0xFF0057D8).withOpacity(0.05),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.account_balance_wallet, color: Color(0xFF0057D8), size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Pay to: $_gcashName ($_gcashNumber)',
                      style: const TextStyle(
                        color: Color(0xFF0057D8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Countdown
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _countdown < 60
                    ? AppTheme.errorColor.withOpacity(0.1)
                    : AppTheme.warningColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.timer,
                    color: _countdown < 60
                        ? AppTheme.errorColor
                        : AppTheme.warningColor,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Time remaining: ${_formatTime(_countdown)}',
                    style: TextStyle(
                      color: _countdown < 60
                          ? AppTheme.errorColor
                          : AppTheme.warningColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Instructions
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'How to Pay',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildInstruction('1', 'Open GCash app'),
                    _buildInstruction('2', 'Tap "Scan QR"'),
                    _buildInstruction('3', 'Scan the QR code above'),
                    _buildInstruction('4', 'Confirm payment details'),
                    _buildInstruction('5', 'Enter your MPIN to complete'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Confirm button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _checkPaymentStatus,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0057D8),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isProcessing
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text('I\'ve Completed the Payment'),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Cancel'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstruction(String number, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: const Color(0xFF0057D8).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(
                  color: Color(0xFF0057D8),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Text(text),
        ],
      ),
    );
  }
}
