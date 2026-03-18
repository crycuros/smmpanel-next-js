import 'package:flutter/material.dart';
import '../../../core/config/theme.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats cards
            Row(
              children: [
                Expanded(child: _buildStatCard('Users', '150', Icons.people, AppTheme.primaryColor)),
                const SizedBox(width: 12),
                Expanded(child: _buildStatCard('Orders', '450', Icons.shopping_bag, AppTheme.secondaryColor)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildStatCard('Revenue', '\$12,500', Icons.attach_money, AppTheme.successColor)),
                const SizedBox(width: 12),
                Expanded(child: _buildStatCard('Tickets', '25', Icons.support_agent, AppTheme.warningColor)),
              ],
            ),
            const SizedBox(height: 24),
            // Quick actions
            const Text(
              'Quick Actions',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 12),
            _buildActionTile('Manage Users', Icons.people, () {}),
            _buildActionTile('Manage Services', Icons.grid_view, () {}),
            _buildActionTile('Manage Orders', Icons.shopping_bag, () {}),
            _buildActionTile('Add Funds', Icons.attach_money, () {}),
            _buildActionTile('Support Tickets', Icons.support_agent, () {}),
            _buildActionTile('Settings', Icons.settings, () {}),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile(String title, IconData icon, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.primaryColor),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
