/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/settings/security_screen.dart
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
 * Flutter screen: security_screen
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
import '../../core/widgets/feature_screen.dart';

class SecurityScreen extends StatelessWidget {
  const SecurityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return FeatureScreen(
      title: 'Security & Sessions',
      showBack: true,
      child: Column(
        children: const [
          SectionCard(title: 'Biometric unlock', subtitle: 'Enabled', icon: Icons.fingerprint),
          SectionCard(title: 'iPhone 15 Pro', subtitle: 'Current device · Active now', icon: Icons.phone_iphone),
          SectionCard(title: 'Chrome on Mac', subtitle: 'Last active 2 days ago', icon: Icons.computer),
        ],
      ),
    );
  }
}
