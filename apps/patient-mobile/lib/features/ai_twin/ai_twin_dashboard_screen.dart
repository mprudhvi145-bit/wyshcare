/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/ai_twin/ai_twin_dashboard_screen.dart
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
 * Flutter screen: ai_twin_dashboard_screen
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

class AiTwinDashboardScreen extends StatelessWidget {
  const AiTwinDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return FeatureScreen(
      title: 'AI Health Twin',
      showBack: true,
      child: Column(
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Health Score', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  const Text('82/100', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                  const Text('Risk level: Moderate', style: TextStyle(color: AppTheme.warning)),
                ],
              ),
            ),
          ),
          SectionCard(title: 'Ask your twin', subtitle: 'Symptom check & guidance', icon: Icons.chat, onTap: () => context.push('/ai-twin/ask')),
          SectionCard(title: 'Risk alerts', subtitle: '2 active alerts', icon: Icons.warning_amber, onTap: () => context.push('/ai-twin/risks')),
          SectionCard(title: 'Health trends', subtitle: 'BP, glucose, weight', icon: Icons.show_chart, onTap: () => context.push('/ai-twin/trends')),
        ],
      ),
    );
  }
}
