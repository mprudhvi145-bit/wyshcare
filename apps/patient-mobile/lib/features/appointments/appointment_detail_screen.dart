/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/appointments/appointment_detail_screen.dart
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
 * Flutter screen: appointment_detail_screen
 *
 * Responsibilities:
 * - Implement mobile functionality in Flutter
 *
 * Used By:
 - apps/patient-mobile/lib/features/family/family_member_detail_screen.dart
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/pharmacy/pharmacy_cart_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/patient-mobile/lib/features/settings/notification_prefs_screen.dart
 - apps/doctor-mobile/lib/core/widgets/patient_context_bar.dart
 - apps/patient-mobile/lib/features/appointments/booking_screen.dart
 - apps/patient-mobile/lib/features/family/add_family_member_screen.dart
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
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/feature_screen.dart';

class AppointmentDetailScreen extends StatelessWidget {
  const AppointmentDetailScreen({super.key, required this.appointmentId});
  final String appointmentId;

  @override
  Widget build(BuildContext context) {
    return FeatureScreen(
      title: 'Appointment',
      showBack: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Appointment $appointmentId'),
          const SizedBox(height: 16),
          const SectionCard(title: 'Dr. Arun Sharma', subtitle: 'General Physician', icon: Icons.person),
          const SizedBox(height: 16),
          FilledButton.icon(
            style: FilledButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: AppTheme.background),
            onPressed: () => context.push('/appointments/$appointmentId/join'),
            icon: const Icon(Icons.videocam),
            label: const Text('Join consultation'),
          ),
        ],
      ),
    );
  }
}
