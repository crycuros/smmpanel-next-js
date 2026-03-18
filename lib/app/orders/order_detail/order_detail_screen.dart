import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/config/theme.dart';
import '../../../core/providers/order_provider.dart';
import '../../../core/providers/currency_provider.dart';

class OrderDetailScreen extends StatefulWidget {
  final int orderId;

  const OrderDetailScreen({
    super.key,
    required this.orderId,
  });

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  @override
  void initState() {
    super.initState();
    _loadOrderDetails();
  }

  Future<void> _loadOrderDetails() async {
    final orderProvider = context.read<OrderProvider>();
    await orderProvider.fetchOrderDetails(widget.orderId);
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = context.watch<OrderProvider>();
    final currencyProvider = context.watch<CurrencyProvider>();
    final order = orderProvider.selectedOrder;

    return Scaffold(
      appBar: AppBar(
        title: Text('Order #${widget.orderId}'),
      ),
      body: orderProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : order == null
              ? const Center(child: Text('Order not found'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildStatusCard(order),
                      const SizedBox(height: 16),
                      _buildDetailCard('Order Details', [
                        _DetailItem('Order ID', '#${order.orderId}'),
                        _DetailItem('Service', order.serviceName),
                        _DetailItem('Link', order.link),
                        _DetailItem('Quantity', order.quantity.toInt().toString()),
                        _DetailItem('Price', currencyProvider.formatCurrency(order.price)),
                        _DetailItem('Status', order.statusDisplay),
                      ]),
                      if (order.startCount != null || order.remains != null) ...[
                        const SizedBox(height: 16),
                        _buildProgressCard(order),
                      ],
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatusCard(Order order) {
    Color statusColor;
    IconData statusIcon;
    
    switch (order.status.toLowerCase()) {
      case 'completed':
        statusColor = AppTheme.successColor;
        statusIcon = Icons.check_circle;
        break;
      case 'pending':
        statusColor = AppTheme.warningColor;
        statusIcon = Icons.pending;
        break;
      case 'processing':
        statusColor = AppTheme.infoColor;
        statusIcon = Icons.sync;
        break;
      case 'cancelled':
        statusColor = AppTheme.errorColor;
        statusIcon = Icons.cancel;
        break;
      default:
        statusColor = Colors.grey;
        statusIcon = Icons.help;
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(statusIcon, color: statusColor, size: 32),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    order.statusDisplay,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: statusColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Order placed on ${order.createdAt?.toString() ?? "N/A"}',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressCard(Order order) {
    final startCount = order.startCount ?? 0;
    final remains = order.remains ?? 0;
    final total = startCount + remains;
    final progress = total > 0 ? startCount / total : 0.0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Progress',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey.shade200,
              valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Start: ${startCount.toInt()}'),
                Text('Remains: ${remains.toInt()}'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailCard(String title, List<_DetailItem> items) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 16),
            ...items.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    item.label,
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  Flexible(
                    child: Text(
                      item.value,
                      textAlign: TextAlign.end,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}

class _DetailItem {
  final String label;
  final String value;

  _DetailItem(this.label, this.value);
}
