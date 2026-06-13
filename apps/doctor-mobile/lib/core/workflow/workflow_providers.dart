/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/core/workflow/workflow_providers.dart
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
 * Flutter/Dart module: workflow_providers
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
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../authentication/auth_notifier.dart';
import '../specialty/specialty_registry.dart';
import '../../features/encounters/emr_providers.dart';

class EncounterWorkflowState {
  final WorkflowStepId currentStep;
  final Set<WorkflowStepId> completedSteps;
  final String? specialtyCode;
  final int examinationTabIndex;
  final DateTime? encounterStartedAt;

  const EncounterWorkflowState({
    this.currentStep = WorkflowStepId.intake,
    this.completedSteps = const {},
    this.specialtyCode,
    this.examinationTabIndex = 0,
    this.encounterStartedAt,
  });

  EncounterWorkflowState copyWith({
    WorkflowStepId? currentStep,
    Set<WorkflowStepId>? completedSteps,
    String? specialtyCode,
    int? examinationTabIndex,
    DateTime? encounterStartedAt,
  }) {
    return EncounterWorkflowState(
      currentStep: currentStep ?? this.currentStep,
      completedSteps: completedSteps ?? this.completedSteps,
      specialtyCode: specialtyCode ?? this.specialtyCode,
      examinationTabIndex: examinationTabIndex ?? this.examinationTabIndex,
      encounterStartedAt: encounterStartedAt ?? this.encounterStartedAt,
    );
  }

  SpecialtyConfig get config => SpecialtyRegistry.resolve(specialtyCode);

  int stepIndex(WorkflowStepId id) =>
      config.workflowSteps.indexWhere((s) => s.id == id);

  bool isStepComplete(WorkflowStepId id) => completedSteps.contains(id);
}

class EncounterWorkflowNotifier extends StateNotifier<EncounterWorkflowState> {
  EncounterWorkflowNotifier(this._ref) : super(const EncounterWorkflowState());

  final Ref _ref;

  void startEncounter({String? specialtyCode}) {
    final profile = _ref.read(authProvider).doctorProfile;
    final code = specialtyCode ??
        SpecialtyRegistry.primaryCodeFromProfile(profile?.specialization != null ? [profile!.specialization!] : []);

    state = EncounterWorkflowState(
      currentStep: WorkflowStepId.intake,
      completedSteps: {WorkflowStepId.intake},
      specialtyCode: code,
      encounterStartedAt: DateTime.now(),
    );

    _ref.read(activePatientStateProvider.notifier).setSpecialty(code);
  }

  void goToStep(WorkflowStepId step) {
    state = state.copyWith(currentStep: step);
  }

  void completeStep(WorkflowStepId step) {
    final completed = {...state.completedSteps, step};
    final steps = state.config.workflowSteps;
    final idx = steps.indexWhere((s) => s.id == step);
    final next = idx < steps.length - 1 ? steps[idx + 1].id : step;

    state = state.copyWith(
      completedSteps: completed,
      currentStep: next,
    );
  }

  void setExaminationTab(int index) {
    state = state.copyWith(examinationTabIndex: index);
  }

  void reset() {
    state = const EncounterWorkflowState();
  }
}

final encounterWorkflowProvider =
    StateNotifierProvider<EncounterWorkflowNotifier, EncounterWorkflowState>(
  (ref) => EncounterWorkflowNotifier(ref),
);

final doctorSpecialtyProvider = Provider<SpecialtyConfig>((ref) {
  final profile = ref.watch(authProvider).doctorProfile;
  final active = ref.watch(activePatientStateProvider).specialtyCode;
  if (active != null) return SpecialtyRegistry.resolve(active);
  return SpecialtyRegistry.resolve(
    SpecialtyRegistry.primaryCodeFromProfile(profile?.specialization != null ? [profile!.specialization!] : []),
  );
});
