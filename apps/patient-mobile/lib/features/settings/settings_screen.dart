/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/settings/settings_screen.dart
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
 * Flutter screen: settings_screen
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
import '../../core/widgets/feature_screen.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SectionCard(title: 'Profile', subtitle: ref.watch(authProvider).profile?.fullName ?? 'Your account', icon: Icons.person, onTap: () {}),
        SectionCard(title: 'Family', subtitle: 'Manage dependents', icon: Icons.family_restroom, onTap: () => context.push('/family')),
        SectionCard(title: 'Insurance', subtitle: 'Policies and claims', icon: Icons.shield, onTap: () => context.push('/insurance')),
        SectionCard(title: 'Security & sessions', subtitle: 'Devices and biometrics', icon: Icons.lock, onTap: () => context.push('/settings/security')),
        SectionCard(title: 'Notifications', subtitle: 'Push and email preferences', icon: Icons.notifications, onTap: () => context.push('/settings/notifications')),
        SectionCard(title: 'Emergency profile', subtitle: 'ICE contacts and allergies', icon: Icons.emergency, onTap: () => context.push('/settings/emergency')),
        const SizedBox(height: 24),
        OutlinedButton(
          onPressed: () async {
            await ref.read(authProvider.notifier).logout();
            if (context.mounted) context.go('/login');
          },
          child: const Text('Sign out'),
        ),
      ],
    );
  }
}
