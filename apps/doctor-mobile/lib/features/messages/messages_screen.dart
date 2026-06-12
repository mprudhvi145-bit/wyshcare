/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/messages/messages_screen.dart
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * Flutter screen: messages_screen
 *
 * Responsibilities:
 * - Implement mobile functionality in Flutter
 *
 * Used By:
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/family/family_member_detail_screen.dart
 - apps/patient-mobile/lib/features/pharmacy/pharmacy_cart_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/patient-mobile/lib/features/settings/notification_prefs_screen.dart
 - apps/doctor-mobile/lib/core/widgets/patient_context_bar.dart
 - apps/doctor-mobile/lib/core/authentication/auth_notifier.dart
 - apps/patient-mobile/lib/features/appointments/booking_screen.dart
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Mobile
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';

class MessagesScreen extends ConsumerStatefulWidget {
  const MessagesScreen({super.key});

  @override
  ConsumerState<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends ConsumerState<MessagesScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(48),
        child: AppBar(
          bottom: TabBar(
            controller: _tabController,
            indicatorColor: AppTheme.primary,
            labelColor: AppTheme.primary,
            unselectedLabelColor: AppTheme.textSecondary,
            tabs: const [
              Tab(text: 'Patients'),
              Tab(text: 'Providers'),
              Tab(text: 'Referrals'),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildChatList('Patients'),
          _buildChatList('Providers'),
          _buildChatList('Referrals'),
        ],
      ),
    );
  }

  Widget _buildChatList(String type) {
    // Simulated chat list depending on type
    final items = type == 'Patients'
        ? [
            {'name': 'Aarav Sharma', 'lastMsg': 'Thank you doctor, the pain is less now.', 'time': '2h ago', 'unread': true},
            {'name': 'Priya Patel', 'lastMsg': 'Can I reschedule my checkup for tomorrow?', 'time': '4h ago', 'unread': false},
            {'name': 'Rahul Varma', 'lastMsg': 'Are the lab results ready?', 'time': 'Yesterday', 'unread': false},
          ]
        : type == 'Providers'
            ? [
                {'name': 'Dr. Sarah Mathew (Orthopedics)', 'lastMsg': 'Please review the knee MRI report.', 'time': '30m ago', 'unread': true},
                {'name': 'Dr. Anand Kumar (Cardiology)', 'lastMsg': 'Patient is cleared for dental extraction.', 'time': '3h ago', 'unread': false},
              ]
            : [
                {'name': 'WyshCare Lab Partner', 'lastMsg': 'Diagnostic panel results uploaded.', 'time': '1d ago', 'unread': false},
                {'name': 'City Pharmacy', 'lastMsg': 'Dispensing complete for prescription ID #39281.', 'time': '2d ago', 'unread': false},
              ];

    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: items.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, idx) {
        final chat = items[idx] as Map<String, dynamic>;
        return ListTile(
          leading: CircleAvatar(
            backgroundColor: AppTheme.glassBorder,
            child: Text((chat['name'] as String)[0], style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(chat['name']! as String, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text(chat['time']! as String, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
            ],
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              chat['lastMsg']! as String,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: chat['unread'] as bool ? AppTheme.textPrimary : AppTheme.textSecondary,
                fontWeight: chat['unread'] as bool ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ),
          trailing: chat['unread'] as bool
              ? const CircleAvatar(radius: 6, backgroundColor: AppTheme.secondary)
              : const Icon(Icons.arrow_forward_ios, size: 12, color: AppTheme.textMuted),
          onTap: () {
            _openChatConversation(context, chat['name']! as String);
          },
        );
      },
    );
  }

  void _openChatConversation(BuildContext context, String title) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _buildMessageBubble('Hello Doctor, I wanted to follow up on my prescription.', '10:00 AM', false),
                    _buildMessageBubble('Sure, how are you feeling today?', '10:02 AM', true),
                    _buildMessageBubble('Much better. The fever is gone, but I still have a mild headache.', '10:05 AM', false),
                  ],
                ),
              ),
              _buildChatInputField(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble(String content, String time, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: const BoxConstraints(maxWidth: 280),
        decoration: BoxDecoration(
          color: isMe ? AppTheme.primary.withOpacity(0.2) : AppTheme.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(12),
            topRight: const Radius.circular(12),
            bottomLeft: isMe ? const Radius.circular(12) : const Radius.circular(0),
            bottomRight: isMe ? const Radius.circular(0) : const Radius.circular(12),
          ),
          border: Border.all(color: AppTheme.glassBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(content, style: const TextStyle(fontSize: 14)),
            const SizedBox(height: 4),
            Align(
              alignment: Alignment.bottomRight,
              child: Text(time, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatInputField(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        border: Border(top: BorderSide(color: AppTheme.glassBorder)),
      ),
      child: Row(
        children: [
          IconButton(icon: const Icon(Icons.attach_file, color: AppTheme.primary), onPressed: () {}),
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Type your message...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                filled: true,
                fillColor: AppTheme.background,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: AppTheme.primary,
            child: IconButton(
              icon: const Icon(Icons.send, color: AppTheme.background, size: 18),
              onPressed: () {},
            ),
          ),
        ],
      ),
    );
  }
}
