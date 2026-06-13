/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/home/home_screen.dart
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
 * Flutter screen: home_screen
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
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/authentication/auth_notifier.dart';
import '../../core/theme/app_theme.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = ref.watch(authProvider).profile?.fullName.split(' ').first ?? 'there';

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(child: Text('Good morning, $name 👋', style: Theme.of(context).textTheme.headlineMedium)),
            IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {}),
          ],
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Health Summary', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                    TextButton(onPressed: () => context.push('/ai-twin'), child: const Text('View AI Twin')),
                  ],
                ),
                const SizedBox(height: 12),
                const Text('Overall Health Score: 82/100', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                const SizedBox(height: 8),
                const Text('Next appointment: Tomorrow, 10:30 AM', style: TextStyle(color: AppTheme.textSecondary)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        const Text('Quick Actions', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Row(
          children: [
            _QuickAction(icon: Icons.calendar_month, label: 'Book Doctor', onTap: () => context.push('/appointments/book')),
            _QuickAction(icon: Icons.videocam, label: 'Consult Now', onTap: () => context.push('/discover')),
            _QuickAction(icon: Icons.medication, label: 'Order Meds', onTap: () => context.push('/pharmacy')),
            _QuickAction(icon: Icons.biotech, label: 'Lab Test', onTap: () => context.push('/diagnostics/book')),
          ],
        ),
        const SizedBox(height: 20),
        const Text('Recent Activity', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        _ActivityTile(title: 'Prescription issued', subtitle: 'Dr. Mehta — Yesterday', onTap: () => context.push('/prescriptions')),
        _ActivityTile(title: 'Lab report uploaded', subtitle: 'Blood Test — 2 days ago', onTap: () => context.push('/records')),
        _ActivityTile(title: 'Order delivered', subtitle: 'Apollo Pharma — 3 days ago', onTap: () => context.push('/pharmacy/orders')),
      ],
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Column(children: [Icon(icon, color: AppTheme.primary), const SizedBox(height: 8), Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11))]),
            ),
          ),
        ),
      ),
    );
  }
}

class _ActivityTile extends StatelessWidget {
  const _ActivityTile({required this.title, required this.subtitle, required this.onTap});
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(title: Text(title), subtitle: Text(subtitle), trailing: const Icon(Icons.chevron_right), onTap: onTap),
    );
  }
}
