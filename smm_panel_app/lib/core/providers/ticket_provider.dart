import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TicketProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService(/*storageService*/);

  List<Ticket> _tickets = [];
  Ticket? _selectedTicket;
  bool _isLoading = false;
  String? _error;

  List<Ticket> get tickets => _tickets;
  Ticket? get selectedTicket => _selectedTicket;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Fetch tickets
  Future<void> fetchTickets({String? status}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.getTickets(status: status);

    _isLoading = false;
    if (response.success && response.data != null) {
      final List<dynamic> ticketsList = response.data['tickets'] ?? [];
      _tickets = ticketsList.map((t) => Ticket.fromJson(t)).toList();
    } else {
      _error = response.error;
    }
    notifyListeners();
  }

  // Fetch ticket details
  Future<Ticket?> fetchTicketDetails(int ticketId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.getTicketDetails(ticketId);

    _isLoading = false;
    if (response.success && response.data != null) {
      _selectedTicket = Ticket.fromJson(response.data);
    } else {
      _error = response.error;
    }
    notifyListeners();

    return _selectedTicket;
  }

  // Create ticket
  Future<Ticket?> createTicket({
    required String subject,
    required String message,
    required String priority,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.createTicket({
      'subject': subject,
      'message': message,
      'priority': priority,
    });

    _isLoading = false;
    if (response.success && response.data != null) {
      final newTicket = Ticket.fromJson(response.data);
      _tickets.insert(0, newTicket);
      notifyListeners();
      return newTicket;
    } else {
      _error = response.error;
      notifyListeners();
      return null;
    }
  }

  // Reply to ticket
  Future<bool> replyToTicket(int ticketId, String message) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _apiService.replyToTicket(ticketId, message);

    _isLoading = false;
    if (response.success) {
      // Refresh ticket details
      if (_selectedTicket != null && _selectedTicket!.id == ticketId) {
        await fetchTicketDetails(ticketId);
      }
      return true;
    } else {
      _error = response.error;
      notifyListeners();
      return false;
    }
  }

  // Get tickets by status
  List<Ticket> getTicketsByStatus(String status) {
    return _tickets.where((t) => t.status.toLowerCase() == status.toLowerCase()).toList();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Clear tickets
  void clearTickets() {
    _tickets = [];
    notifyListeners();
  }
}

class Ticket {
  final int id;
  final String ticketId;
  final String? userId;
  final String subject;
  final String message;
  final String status;
  final String priority;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<TicketMessage>? messages;

  Ticket({
    required this.id,
    required this.ticketId,
    this.userId,
    required this.subject,
    required this.message,
    required this.status,
    required this.priority,
    this.createdAt,
    this.updatedAt,
    this.messages,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['id'] ?? 0,
      ticketId: json['ticket_id'] ?? '',
      userId: json['user_id'],
      subject: json['subject'] ?? '',
      message: json['message'] ?? '',
      status: json['status'] ?? 'Open',
      priority: json['priority'] ?? 'Medium',
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
      updatedAt: json['updated_at'] != null ? DateTime.tryParse(json['updated_at']) : null,
      messages: json['messages'] != null 
          ? (json['messages'] as List).map((m) => TicketMessage.fromJson(m)).toList()
          : null,
    );
  }

  String get statusDisplay {
    switch (status.toLowerCase()) {
      case 'open':
        return 'Open';
      case 'answered':
        return 'Answered';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  }

  String get priorityDisplay {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      default:
        return priority;
    }
  }
}

class TicketMessage {
  final int id;
  final int ticketId;
  final String? userId;
  final String message;
  final String type; // 'user' or 'admin'
  final DateTime? createdAt;

  TicketMessage({
    required this.id,
    required this.ticketId,
    this.userId,
    required this.message,
    required this.type,
    this.createdAt,
  });

  factory TicketMessage.fromJson(Map<String, dynamic> json) {
    return TicketMessage(
      id: json['id'] ?? 0,
      ticketId: json['ticket_id'] ?? 0,
      userId: json['user_id'],
      message: json['message'] ?? '',
      type: json['type'] ?? 'user',
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }
}
