import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/config/theme.dart';
import '../../../core/providers/ticket_provider.dart';

class TicketDetailScreen extends StatefulWidget {
  final int ticketId;

  const TicketDetailScreen({
    super.key,
    required this.ticketId,
  });

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  final _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadTicketDetails();
  }

  Future<void> _loadTicketDetails() async {
    final ticketProvider = context.read<TicketProvider>();
    await ticketProvider.fetchTicketDetails(widget.ticketId);
  }

  Future<void> _sendReply() async {
    if (_messageController.text.isEmpty) return;

    final ticketProvider = context.read<TicketProvider>();
    final success = await ticketProvider.replyToTicket(
      widget.ticketId,
      _messageController.text,
    );

    if (success && mounted) {
      _messageController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Reply sent successfully'),
          backgroundColor: AppTheme.successColor,
        ),
      );
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ticketProvider = context.watch<TicketProvider>();
    final ticket = ticketProvider.selectedTicket;

    return Scaffold(
      appBar: AppBar(
        title: Text('Ticket #${widget.ticketId}'),
      ),
      body: ticketProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : ticket == null
              ? const Center(child: Text('Ticket not found'))
              : Column(
                  children: [
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          // Ticket info
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    ticket.subject,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppTheme.successColor.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          ticket.statusDisplay,
                                          style: const TextStyle(
                                            color: AppTheme.successColor,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppTheme.warningColor.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          ticket.priorityDisplay,
                                          style: const TextStyle(
                                            color: AppTheme.warningColor,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(ticket.message),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          // Messages
                          if (ticket.messages != null)
                            ...ticket.messages!.map((msg) => _buildMessageBubble(msg)),
                        ],
                      ),
                    ),
                    // Reply input
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, -5),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _messageController,
                              decoration: const InputDecoration(
                                hintText: 'Type your reply...',
                                border: OutlineInputBorder(),
                              ),
                              maxLines: null,
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            onPressed: ticketProvider.isLoading ? null : _sendReply,
                            icon: const Icon(Icons.send),
                            color: AppTheme.primaryColor,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildMessageBubble(TicketMessage message) {
    final isUser = message.type == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isUser
              ? AppTheme.primaryColor.withOpacity(0.1)
              : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(message.message),
            const SizedBox(height: 4),
            Text(
              message.createdAt?.toString() ?? '',
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
