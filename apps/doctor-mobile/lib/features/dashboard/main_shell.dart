/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/dashboard/main_shell.dart
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
 * Flutter/Dart module: main_shell
 *
 * Responsibilities:
 * - Implement ai functionality in Flutter
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
AI
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
import '../../core/workflow/workflow_providers.dart';
import '../ai_copilot/ai_scribe_panel.dart';
import '../billing/billing_screen.dart';
import '../messages/messages_screen.dart';
import '../profile/profile_screen.dart';
import '../queue/queue_screen.dart';
import '../schedule/schedule_screen.dart';
import '../telemedicine/telemedicine_screen.dart';
import 'dashboard_screen.dart';

class MainShell extends ConsumerStatefulWidget {
  const MainShell({super.key});

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  int _currentIndex = 0;
  bool _isCopilotExpanded = false;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const ScheduleScreen(),
    const QueueScreen(),
    const MessagesScreen(),
    const TelemedicineScreen(),
    const BillingScreen(),
    const ProfileScreen(),
  ];

  final List<String> _titles = [
    'Clinical Operating System',
    'Schedule Planner',
    'Patient Queue Manager',
    'Messages Center',
    'Telehealth Console',
    'Billing & Revenue',
    'Profile Settings',
  ];

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final isTablet = mediaQuery.size.width >= 720;
    final specialty = ref.watch(doctorSpecialtyProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_titles[_currentIndex], style: const TextStyle(fontSize: 16)),
            if (_currentIndex == 0)
              Text(specialty.label, style: TextStyle(fontSize: 11, color: specialty.accent, fontWeight: FontWeight.w600)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync, color: AppTheme.primary),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Synchronizing records offline...')),
              );
            },
          ),
          if (!isTablet)
            IconButton(
              icon: const Icon(Icons.assistant, color: AppTheme.primary),
              onPressed: () {
                setState(() {
                  _isCopilotExpanded = !_isCopilotExpanded;
                });
              },
            ),
        ],
      ),
      body: Stack(
        children: [
          Row(
            children: [
              // Navigation Rail for tablets
              if (isTablet) ...[
                NavigationRail(
                  selectedIndex: _currentIndex,
                  onDestinationSelected: (idx) {
                    setState(() => _currentIndex = idx);
                  },
                  backgroundColor: AppTheme.surface,
                  selectedIconTheme: const IconThemeData(color: AppTheme.primary),
                  unselectedIconTheme: const IconThemeData(color: AppTheme.textMuted),
                  labelType: NavigationRailLabelType.all,
                  selectedLabelTextStyle: const TextStyle(color: AppTheme.primary, fontSize: 12),
                  unselectedLabelTextStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                  destinations: const [
                    NavigationRailDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: Text('Dashboard')),
                    NavigationRailDestination(icon: Icon(Icons.calendar_today_outlined), selectedIcon: Icon(Icons.calendar_today), label: Text('Schedule')),
                    NavigationRailDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: Text('Queue')),
                    NavigationRailDestination(icon: Icon(Icons.forum_outlined), selectedIcon: Icon(Icons.forum), label: Text('Messages')),
                    NavigationRailDestination(icon: Icon(Icons.videocam_outlined), selectedIcon: Icon(Icons.videocam), label: Text('Telehealth')),
                    NavigationRailDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: Text('Billing')),
                    NavigationRailDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: Text('Profile')),
                  ],
                ),
                const VerticalDivider(width: 1, thickness: 1),
              ],

              // Central Panel: main content
              Expanded(
                flex: 3,
                child: IndexedStack(
                  index: _currentIndex,
                  children: _screens,
                ),
              ),

              // Right Sidebar: Persistent AI Copilot panel on tablets
              if (isTablet) ...[
                const VerticalDivider(width: 1, thickness: 1),
                const SizedBox(
                  width: 320,
                  child: AiScribePanel(),
                ),
              ],
            ],
          ),

          // Bottom Sheet / Floating Overlay for Copilot on Mobile
          if (!isTablet && _isCopilotExpanded)
            Positioned(
              right: 16,
              bottom: 80,
              top: 16,
              width: 340,
              child: Card(
                color: AppTheme.surface.withOpacity(0.95),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: AppTheme.glassBorder),
                ),
                child: Stack(
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 16),
                      child: AiScribePanel(),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: IconButton(
                        icon: const Icon(Icons.close, size: 18, color: AppTheme.textMuted),
                        onPressed: () => setState(() => _isCopilotExpanded = false),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),

      // Floating Action Button on mobile to trigger Copilot
      floatingActionButton: (!isTablet && !_isCopilotExpanded)
          ? FloatingActionButton(
              backgroundColor: AppTheme.primary,
              foregroundColor: AppTheme.background,
              onPressed: () => setState(() => _isCopilotExpanded = true),
              child: const Icon(Icons.assistant),
            )
          : null,

      // Navigation Bar for mobile
      bottomNavigationBar: !isTablet
          ? BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (idx) {
                setState(() => _currentIndex = idx);
              },
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Dashboard'),
                BottomNavigationBarItem(icon: Icon(Icons.calendar_today_outlined), activeIcon: Icon(Icons.calendar_today), label: 'Schedule'),
                BottomNavigationBarItem(icon: Icon(Icons.people_outline), activeIcon: Icon(Icons.people), label: 'Queue'),
                BottomNavigationBarItem(icon: Icon(Icons.forum_outlined), activeIcon: Icon(Icons.forum), label: 'Messages'),
                BottomNavigationBarItem(icon: Icon(Icons.videocam_outlined), activeIcon: Icon(Icons.videocam), label: 'Telehealth'),
                BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), activeIcon: Icon(Icons.receipt_long), label: 'Billing'),
                BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
              ],
            )
          : null,
    );
  }
}
