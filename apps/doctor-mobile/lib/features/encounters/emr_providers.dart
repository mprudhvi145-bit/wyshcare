/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/encounters/emr_providers.dart
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
 * Flutter/Dart module: emr_providers
 *
 * Responsibilities:
 * - Implement doctor functionality in Flutter
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

import 'package:flutter_riverpod/flutter_riverpod.dart';

class ActivePatientState {
  final String? patientId;
  final String? patientName;
  final String? wyshId;
  final String? encounterId;
  final String? specialtyCode;

  const ActivePatientState({
    this.patientId,
    this.patientName,
    this.wyshId,
    this.encounterId,
    this.specialtyCode,
  });

  ActivePatientState copyWith({
    String? patientId,
    String? patientName,
    String? wyshId,
    String? encounterId,
    String? specialtyCode,
  }) {
    return ActivePatientState(
      patientId: patientId ?? this.patientId,
      patientName: patientName ?? this.patientName,
      wyshId: wyshId ?? this.wyshId,
      encounterId: encounterId ?? this.encounterId,
      specialtyCode: specialtyCode ?? this.specialtyCode,
    );
  }
}

class ActivePatientNotifier extends StateNotifier<ActivePatientState> {
  ActivePatientNotifier() : super(const ActivePatientState());

  void selectPatient({
    required String patientId,
    required String patientName,
    required String wyshId,
    String? encounterId,
    String? specialtyCode,
  }) {
    state = ActivePatientState(
      patientId: patientId,
      patientName: patientName,
      wyshId: wyshId,
      encounterId: encounterId,
      specialtyCode: specialtyCode ?? 'general-medicine',
    );
  }

  void setEncounterId(String id) {
    state = state.copyWith(encounterId: id);
  }

  void setSpecialty(String code) {
    state = state.copyWith(specialtyCode: code);
  }

  void clear() {
    state = const ActivePatientState();
  }
}

final activePatientStateProvider = StateNotifierProvider<ActivePatientNotifier, ActivePatientState>((ref) {
  return ActivePatientNotifier();
});
