import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/dependency_injection.dart';
import '../../../core/config/theme.dart';

class AdminSettingsScreen extends StatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  State<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen> {
  final ApiService _apiService = DependencyInjection.getIt<ApiService>();
  bool _isLoading = true;
  Map<String, dynamic> _settings = {};
  
  // Form controllers
  late TextEditingController _siteNameController;
  late TextEditingController _siteDescriptionController;
  late TextEditingController _gcashNumberController;
  late TextEditingController _gcashNameController;
  late TextEditingController _telegramController;
  late TextEditingController _discordController;
  late TextEditingController _supportEmailController;
  late TextEditingController _minDepositController;
  late TextEditingController _minOrderController;

  @override
  void initState() {
    super.initState();
    _siteNameController = TextEditingController();
    _siteDescriptionController = TextEditingController();
    _gcashNumberController = TextEditingController();
    _gcashNameController = TextEditingController();
    _telegramController = TextEditingController();
    _discordController = TextEditingController();
    _supportEmailController = TextEditingController();
    _minDepositController = TextEditingController();
    _minOrderController = TextEditingController();
    _loadSettings();
  }

  @override
  void dispose() {
    _siteNameController.dispose();
    _siteDescriptionController.dispose();
    _gcashNumberController.dispose();
    _gcashNameController.dispose();
    _telegramController.dispose();
    _discordController.dispose();
    _supportEmailController.dispose();
    _minDepositController.dispose();
    _minOrderController.dispose();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    setState(() => _isLoading = true);
    try {
      final response = await _apiService.getSettings();
      if (response.success && response.data != null) {
        _settings = response.data;
        _updateControllers();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading settings: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _updateControllers() {
    _siteNameController.text = _settings['site_name'] ?? 'MND SMM Panel';
    _siteDescriptionController.text = _settings['site_description'] ?? '';
    _gcashNumberController.text = _settings['gcash_number'] ?? '';
    _gcashNameController.text = _settings['gcash_name'] ?? '';
    _telegramController.text = _settings['telegram'] ?? '';
    _discordController.text = _settings['discord'] ?? '';
    _supportEmailController.text = _settings['support_email'] ?? '';
    _minDepositController.text = (_settings['min_deposit'] ?? 50).toString();
    _minOrderController.text = (_settings['min_order'] ?? 10).toString();
  }

  Future<void> _saveSettings() async {
    final settings = {
      'site_name': _siteNameController.text,
      'site_description': _siteDescriptionController.text,
      'gcash_number': _gcashNumberController.text,
      'gcash_name': _gcashNameController.text,
      'telegram': _telegramController.text,
      'discord': _discordController.text,
      'support_email': _supportEmailController.text,
      'min_deposit': double.tryParse(_minDepositController.text) ?? 50,
      'min_order': double.tryParse(_minOrderController.text) ?? 10,
    };

    try {
      final response = await _apiService.updateSettings(settings);
      if (response.success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Settings saved successfully!'),
              backgroundColor: AppTheme.successColor,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.error ?? 'Failed to save settings'),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _saveSettings,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader('Site Information', Icons.web),
                  _buildTextField(
                    controller: _siteNameController,
                    label: 'Site Name',
                    icon: Icons.title,
                  ),
                  _buildTextField(
                    controller: _siteDescriptionController,
                    label: 'Site Description',
                    icon: Icons.description,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 24),
                  
                  _buildSectionHeader('GCash Payment', Icons.payment),
                  _buildTextField(
                    controller: _gcashNumberController,
                    label: 'GCash Number',
                    icon: Icons.phone,
                    keyboardType: TextInputType.phone,
                  ),
                  _buildTextField(
                    controller: _gcashNameController,
                    label: 'GCash Account Name',
                    icon: Icons.person,
                  ),
                  const SizedBox(height: 24),
                  
                  _buildSectionHeader('Support Links', Icons.link),
                  _buildTextField(
                    controller: _telegramController,
                    label: 'Telegram Channel',
                    icon: Icons.send,
                    keyboardType: TextInputType.url,
                  ),
                  _buildTextField(
                    controller: _discordController,
                    label: 'Discord Server',
                    icon: Icons.discord,
                    keyboardType: TextInputType.url,
                  ),
                  _buildTextField(
                    controller: _supportEmailController,
                    label: 'Support Email',
                    icon: Icons.email,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 24),
                  
                  _buildSectionHeader('Limits', Icons.tune),
                  _buildTextField(
                    controller: _minDepositController,
                    label: 'Minimum Deposit (PHP)',
                    icon: Icons.savings,
                    keyboardType: TextInputType.number,
                  ),
                  _buildTextField(
                    controller: _minOrderController,
                    label: 'Minimum Order (PHP)',
                    icon: Icons.shopping_cart,
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 32),
                  
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _saveSettings,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Save Settings',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primaryColor),
          const SizedBox(width: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    int maxLines = 1,
    TextInputType? keyboardType,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          filled: true,
        ),
      ),
    );
  }
}
