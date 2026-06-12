/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/diagnostics/diagnostics_booking_screen.dart
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
 * Flutter screen: diagnostics_booking_screen
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
import '../../core/theme/app_theme.dart';
import '../../core/widgets/feature_screen.dart';

class DiagnosticsBookingScreen extends StatelessWidget {
  const DiagnosticsBookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return FeatureScreen(
      title: 'Book Lab Test',
      showBack: true,
      child: Column(
        children: [
          const SectionCard(title: 'Complete Blood Count', subtitle: '₹399 · Home collection', icon: Icons.bloodtype),
          const SectionCard(title: 'Thyroid Profile', subtitle: '₹699 · Lab visit', icon: Icons.science),
          const SizedBox(height: 24),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: AppTheme.background),
            onPressed: () => Navigator.pop(context),
            child: const Text('Schedule collection'),
          ),
        ],
      ),
    );
  }
}
