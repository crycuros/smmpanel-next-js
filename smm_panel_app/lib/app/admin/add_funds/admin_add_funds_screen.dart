import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/dependency_injection.dart';
import '../../../core/config/theme.dart';

class AdminAddFundsScreen extends StatefulWidget {
  const AdminAddFundsScreen({super.key});

  @override
  State<AdminAddFundsScreen> createState() => _AdminAddFundsScreenState();
}

class _AdminAddFundsScreenState extends State<AdminAddFundsScreen> {
  final ApiService _apiService = DependencyInjection.getIt<ApiService>();
  List<dynamic> _users = [];
  List<dynamic> _fundRequests = [];
  bool _isLoading = true;
  int _selectedTab = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      // Load users for add funds
      final usersResponse = await _apiService.getAllUsers();
      if (usersResponse.success) {
        _users = usersResponse.data['users'] ?? [];
      }
      
      // Load fund requests
      final fundsResponse = await _apiService.get('/api/admin/funds');
      if (fundsResponse.success) {
        _fundRequests = fundsResponse.data['requests'] ?? [];
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
        title: const Text('Add Funds'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        bottom: TabBar(
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'Add to User'),
            Tab(text: 'Fund Requests'),
          ],
          onTap: (index) {
            setState(() => _selectedTab = index);
          },
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _selectedTab == 0
              ? _buildAddFundsTab()
              : _buildFundRequestsTab(),
    );
  }

  Widget _buildAddFundsTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search user...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
            ),
            onChanged: (value) {
              setState(() {});
            },
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _users.length,
            itemBuilder: (context, index) {
              final user = _users[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppTheme.primaryColor,
                    child: Text(
                      (user['name'] ?? user['email'] ?? 'U')[0]
                          .toString()
                          .toUpperCase(),
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                  title: Text(user['name'] ?? 'No Name'),
                  subtitle: Text(user['email'] ?? ''),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '₱${(user['balance'] ?? 0).toString()}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.add_circle, color: AppTheme.successColor),
                        onPressed: () => _showAddFundsDialog(user),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFundRequestsTab() {
    if (_fundRequests.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.request_quote, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No fund requests'),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _fundRequests.length,
        itemBuilder: (context, index) {
          final request = _fundRequests[index];
          return _buildFundRequestCard(request);
        },
      ),
    );
  }

  Widget _buildFundRequestCard(dynamic request) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '₱${(request['amount'] ?? 0).toString()}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                ),
                _buildStatusBadge(request['status'] ?? 'pending'),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: AppTheme.primaryColor,
                  child: Text(
                    (request['user_name'] ?? 'U')[0].toString().toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontSize: 10),
                  ),
                ),
                const SizedBox(width: 8),
                Text(request['user_name'] ?? 'Unknown'),
                const Spacer(),
                Text(
                  request['payment_method'] ?? 'GCash',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Reference: ${request['reference'] ?? 'N/A'}',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
            const SizedBox(height: 12),
            if (request['status'] == 'pending')
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => _updateFundRequest(request['id'], 'rejected'),
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                    child: const Text('Reject'),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () => _updateFundRequest(request['id'], 'approved'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.successColor,
                    ),
                    child: const Text('Approve'),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'approved':
        color = AppTheme.successColor;
        break;
      case 'rejected':
        color = Colors.red;
        break;
      case 'pending':
      default:
        color = Colors.orange;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showAddFundsDialog(dynamic user) {
    final amountController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add Funds to ${user['name'] ?? user['email']}'),
        content: Form(
          key: formKey,
          child: TextFormField(
            controller: amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Amount (PHP)',
              prefixText: '₱ ',
              border: OutlineInputBorder(),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter an amount';
              }
              final amount = double.tryParse(value);
              if (amount == null || amount <= 0) {
                return 'Please enter a valid amount';
              }
              return null;
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                Navigator.pop(context);
                await _addFundsToUser(user['id'], double.parse(amountController.text));
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              foregroundColor: Colors.white,
            ),
            child: const Text('Add Funds'),
          ),
        ],
      ),
    );
  }

  Future<void> _addFundsToUser(int userId, double amount) async {
    try {
      final response = await _apiService.addFundsToUser(userId, amount);
      if (response.success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Funds added successfully!'),
              backgroundColor: AppTheme.successColor,
            ),
          );
          _loadData();
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.error ?? 'Failed to add funds'),
              backgroundColor: AppTheme.errorColor,
            ),
          );
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

  Future<void> _updateFundRequest(int requestId, String status) async {
    try {
      final response = await _apiService.post(
        '/api/admin/funds/$requestId',
        body: {'status': status},
      );
      if (response.success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Fund request $status'),
              backgroundColor: status == 'approved' ? AppTheme.successColor : AppTheme.errorColor,
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
