/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/appointments/telemedicine_room_screen.dart
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
 * Flutter screen: telemedicine_room_screen
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

class TelemedicineRoomScreen extends StatelessWidget {
  const TelemedicineRoomScreen({super.key, required this.appointmentId});
  final String appointmentId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          const Center(child: Icon(Icons.videocam, size: 80, color: AppTheme.textMuted)),
          Positioned(
            top: 48,
            left: 16,
            right: 16,
            child: Text('Consultation $appointmentId', style: const TextStyle(color: Colors.white)),
          ),
          Positioned(
            bottom: 32,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _Control(Icons.mic_off),
                _Control(Icons.videocam_off, color: AppTheme.danger),
                _Control(Icons.chat),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Control extends StatelessWidget {
  const _Control(this.icon, {this.color = AppTheme.surface});
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(radius: 28, backgroundColor: color, child: Icon(icon, color: Colors.white));
  }
}
