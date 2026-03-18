import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/config/theme.dart';
import '../../../core/providers/order_provider.dart';
import '../../../core/providers/currency_provider.dart';
import '../../../core/services/smm_api_service.dart';

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
  bool _isRefreshing = false;

  @override
  void initState() {
    super.initState();
    _loadOrderDetails();
  }

  Future<void> _loadOrderDetails() async {
    final orderProvider = context.read<OrderProvider>();
    await orderProvider.fetchOrderDetails(widget.orderId);
  }

  Future<void> _refreshSMMStatus() async {
    final orderProvider = context.read<OrderProvider>();
    final order = orderProvider.selectedOrder;
    if (order == null || order.apiOrderId == null) return;

    setState(() => _isRefreshing = true);
    await orderProvider.refreshOrderSMMStatus(order);
    setState(() => _isRefreshing = false);
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = context.watch<OrderProvider>();
    final currencyProvider = context.watch<CurrencyProvider>();
    final order = orderProvider.selectedOrder;
    
    // Get SMM status from cache
    SMMOrderStatus? smmStatus;
    if (order?.apiOrderId != null) {
      smmStatus = orderProvider.getCachedSMMStatus(order!.apiOrderId);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Order #${widget.orderId}'),
        actions: [
          if (order?.apiOrderId != null)
            IconButton(
              icon: _isRefreshing 
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.refresh),
              onPressed: _isRefreshing ? null : _refreshSMMStatus,
              tooltip: 'Refresh SMM Status',
            ),
        ],
      ),
      body: orderProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : order == null
              ? const Center(child: Text('Order not found'))
              : RefreshIndicator(
                  onRefresh: _loadOrderDetails,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildStatusCard(order, smmStatus),
                        const SizedBox(height: 16),
                        
                        // SMM API Status Card (if available)
                        if (smmStatus != null) ...[
                          _buildSMMStatusCard(smmStatus),
                          const SizedBox(height: 16),
                        ],
                        
                        _buildDetailCard('Order Details', [
                          _DetailItem('Order ID', '#${order.orderId}'),
                          _DetailItem('Service', order.serviceName),
                          _DetailItem('Link', order.link),
                          _DetailItem('Quantity', order.quantity.toInt().toString()),
                          _DetailItem('Price', currencyProvider.formatCurrency(order.price)),
                          _DetailItem('Status', order.statusDisplay),
                          if (order.apiOrderId != null) 
                            _DetailItem('API Order ID', '#${order.apiOrderId}'),
                        ]),
                        
                        if (smmStatus?.startCount != null || smmStatus?.remains != null || order.startCount != null || order.remains != null) ...[
                          const SizedBox(height: 16),
                          _buildProgressCard(order, smmStatus),
                        ],
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildStatusCard(Order order, SMMOrderStatus? smmStatus) {
    Color statusColor;
    IconData statusIcon;
    
    // Use SMM API status if available, otherwise use local status
    final status = smmStatus?.status ?? order.status;
    
    switch (status.toLowerCase()) {
      case 'completed':
        statusColor = AppTheme.successColor;
        statusIcon = Icons.check_circle;
        break;
      case 'pending':
        statusColor = AppTheme.warningColor;
        statusIcon = Icons.pending;
        break;
      case 'processing':
      case 'in progress':
        statusColor = AppTheme.infoColor;
        statusIcon = Icons.sync;
        break;
      case 'partial':
        statusColor = Colors.orange;
        statusIcon = Icons.warning;
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
                    _getStatusDisplay(status),
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
                  if (smmStatus != null) ...[
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Live from SMM API',
                        style: TextStyle(
                          fontSize: 10,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSMMStatusCard(SMMOrderStatus smmStatus) {
    return Card(
      color: AppTheme.primaryColor.withOpacity(0.05),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.cloud, size: 20, color: AppTheme.primaryColor),
                const SizedBox(width: 8),
                const Text(
                  'SMM API Status',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildSMMStatusItem(
                    'Status',
                    smmStatus.status,
                    _getStatusColor(smmStatus.status),
                  ),
                ),
                if (smmStatus.charge != null)
                  Expanded(
                    child: _buildSMMStatusItem(
                      'Charge',
                      '\$${smmStatus.charge}',
                      Colors.grey,
                    ),
                  ),
                if (smmStatus.currency != null)
                  Expanded(
                    child: _buildSMMStatusItem(
                      'Currency',
                      smmStatus.currency!,
                      Colors.grey,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSMMStatusItem(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildProgressCard(Order order, SMMOrderStatus? smmStatus) {
    // Use SMM API data if available, otherwise use local data
    final startCount = smmStatus?.startCount ?? order.startCount?.toInt() ?? 0;
    final remains = smmStatus?.remains ?? order.remains?.toInt() ?? 0;
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
                Text('Start: $startCount'),
                Text('Remains: $remains'),
                Text('Total: $total'),
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
                  Flexible(
                    child: Text(
                      item.label,
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ),
                  const SizedBox(width: 16),
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

  String _getStatusDisplay(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'processing':
      case 'in progress':
        return 'Processing';
      case 'partial':
        return 'Partial';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return AppTheme.successColor;
      case 'pending':
        return AppTheme.warningColor;
      case 'processing':
      case 'in progress':
        return AppTheme.infoColor;
      case 'partial':
        return Colors.orange;
      case 'cancelled':
        return AppTheme.errorColor;
      default:
        return Colors.grey;
    }
  }
}

class _DetailItem {
  final String label;
  final String value;

  _DetailItem(this.label, this.value);
}
