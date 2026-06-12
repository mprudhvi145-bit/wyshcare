/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/core/widgets/patient_context_bar.dart
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
 * Flutter/Dart module: patient_context_bar
 *
 * Responsibilities:
 * - Implement doctor functionality in Flutter
 *
 * Used By:
 - apps/patient-mobile/lib/features/family/family_member_detail_screen.dart
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/pharmacy/pharmacy_cart_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/patient-mobile/lib/features/settings/notification_prefs_screen.dart
 - apps/patient-mobile/lib/features/appointments/booking_screen.dart
 - apps/patient-mobile/lib/features/family/add_family_member_screen.dart
 - apps/patient-mobile/lib/features/auth/verify_otp_screen.dart
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
Doctor
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
import '../theme/app_theme.dart';

class PatientContextBar extends StatelessWidget {
  const PatientContextBar({
    super.key,
    required this.patientName,
    required this.wyshId,
    this.age,
    this.gender,
    this.riskScore,
    this.allergies = const [],
    this.conditions = const [],
    this.onTimelineTap,
  });

  final String patientName;
  final String wyshId;
  final int? age;
  final String? gender;
  final int? riskScore;
  final List<String> allergies;
  final List<String> conditions;
  final VoidCallback? onTimelineTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 4),
      color: AppTheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.primary.withValues(alpha: 0.2),
                  child: Text(
                    patientName.isNotEmpty ? patientName[0].toUpperCase() : '?',
                    style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(patientName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text(
                        '$wyshId${age != null ? ' · $gender, $age' : ''}',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                if (riskScore != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _riskColor(riskScore!).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text('Risk $riskScore', style: TextStyle(color: _riskColor(riskScore!), fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                if (onTimelineTap != null) ...[
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.timeline, color: AppTheme.primary, size: 20),
                    onPressed: onTimelineTap,
                    tooltip: 'Patient timeline',
                  ),
                ],
              ],
            ),
            if (conditions.isNotEmpty || allergies.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: [
                  ...conditions.map((c) => _badge(c, AppTheme.primary)),
                  ...allergies.map((a) => _badge('⚠ $a', AppTheme.danger)),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Text(text, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
    );
  }

  Color _riskColor(int score) {
    if (score >= 75) return AppTheme.danger;
    if (score >= 50) return AppTheme.warning;
    return AppTheme.secondary;
  }
}
