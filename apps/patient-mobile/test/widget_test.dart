/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/test/widget_test.dart
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
 * Flutter test: validates widget_test
 *
 * Responsibilities:
 * - Implement testing functionality in Flutter
 *
 * Used By:
 - apps/doctor-mobile/lib/features/specialties/widgets/billing_panel.dart
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/auth/login_screen.dart
 - apps/doctor-mobile/lib/features/encounters/emr_workspace_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/doctor-mobile/lib/features/messages/messages_screen.dart
 - apps/doctor-mobile/lib/core/authentication/auth_notifier.dart
 - apps/doctor-mobile/lib/main.dart
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
Testing
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

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:patient_mobile/main.dart';

void main() {
  testWidgets('WyshCare patient app smoke test', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: WyshCarePatientApp()));
    expect(find.text('WyshCare'), findsOneWidget);
  });
}
