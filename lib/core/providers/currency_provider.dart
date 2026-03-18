import 'package:flutter/material.dart';

class CurrencyProvider extends ChangeNotifier {
  String _currency = 'USD';
  String _currencySymbol = '\$';
  double _rate = 1.0;

  String get currency => _currency;
  String get currencySymbol => _currencySymbol;
  double get rate => _rate;

  final Map<String, CurrencyInfo> _currencies = {
    'USD': CurrencyInfo(symbol: '\$', name: 'US Dollar', rate: 1.0),
    'EUR': CurrencyInfo(symbol: '€', name: 'Euro', rate: 0.85),
    'GBP': CurrencyInfo(symbol: '£', name: 'British Pound', rate: 0.73),
    'PHP': CurrencyInfo(symbol: '₱', name: 'Philippine Peso', rate: 50.0),
    'INR': CurrencyInfo(symbol: '₹', name: 'Indian Rupee', rate: 74.0),
    'IDR': CurrencyInfo(symbol: 'Rp', name: 'Indonesian Rupiah', rate: 14300.0),
    'MYR': CurrencyInfo(symbol: 'RM', name: 'Malaysian Ringgit', rate: 4.2),
    'THB': CurrencyInfo(symbol: '฿', name: 'Thai Baht', rate: 33.0),
    'VND': CurrencyInfo(symbol: '₫', name: 'Vietnamese Dong', rate: 23000.0),
    'CNY': CurrencyInfo(symbol: '¥', name: 'Chinese Yuan', rate: 6.45),
    'JPY': CurrencyInfo(symbol: '¥', name: 'Japanese Yen', rate: 110.0),
    'KRW': CurrencyInfo(symbol: '₩', name: 'South Korean Won', rate: 1180.0),
    'AUD': CurrencyInfo(symbol: 'A\$', name: 'Australian Dollar', rate: 1.35),
    'CAD': CurrencyInfo(symbol: 'C\$', name: 'Canadian Dollar', rate: 1.25),
    'SGD': CurrencyInfo(symbol: 'S\$', name: 'Singapore Dollar', rate: 1.35),
  };

  Map<String, CurrencyInfo> get currencies => _currencies;

  void setCurrency(String currency) {
    if (_currencies.containsKey(currency)) {
      _currency = currency;
      _currencySymbol = _currencies[currency]!.symbol;
      _rate = _currencies[currency]!.rate;
      notifyListeners();
    }
  }

  String formatCurrency(double amount) {
    return '$_currencySymbol${(amount * _rate).toStringAsFixed(2)}';
  }

  double convertToBase(double amount) {
    return amount / _rate;
  }

  double convertFromBase(double amount) {
    return amount * _rate;
  }
}

class CurrencyInfo {
  final String symbol;
  final String name;
  final double rate;

  CurrencyInfo({required this.symbol, required this.name, required this.rate});
}
