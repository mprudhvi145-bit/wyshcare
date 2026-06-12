/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/care/care_hub_screen.dart
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
 * Flutter screen: care_hub_screen
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
import '../../core/widgets/feature_screen.dart';

class CareHubScreen extends StatelessWidget {
  const CareHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SectionCard(title: 'Appointments', subtitle: 'Book and manage consultations', icon: Icons.calendar_month, onTap: () => context.push('/appointments')),
        SectionCard(title: 'Doctor Discovery', subtitle: 'Find specialists near you', icon: Icons.search, onTap: () => context.push('/discover')),
        SectionCard(title: 'Medical Records', subtitle: 'Vault and uploaded documents', icon: Icons.folder, onTap: () => context.push('/records')),
        SectionCard(title: 'Prescriptions', subtitle: 'Active and past prescriptions', icon: Icons.description, onTap: () => context.push('/prescriptions')),
        SectionCard(title: 'Diagnostics', subtitle: 'Book lab tests and view results', icon: Icons.biotech, onTap: () => context.push('/diagnostics')),
        SectionCard(title: 'AI Health Twin', subtitle: 'Risks, trends, and insights', icon: Icons.psychology, onTap: () => context.push('/ai-twin')),
      ],
    );
  }
}
