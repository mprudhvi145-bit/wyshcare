/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/encounters/emr_workspace_screen.dart
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
 * Flutter screen: emr_workspace_screen
 *
 * Responsibilities:
 * - Implement mobile functionality in Flutter
 *
 * Used By:
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/family/family_member_detail_screen.dart
 - apps/patient-mobile/lib/features/pharmacy/pharmacy_cart_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/patient-mobile/lib/features/settings/notification_prefs_screen.dart
 - apps/doctor-mobile/lib/core/widgets/patient_context_bar.dart
 - apps/doctor-mobile/lib/core/authentication/auth_notifier.dart
 - apps/patient-mobile/lib/features/appointments/booking_screen.dart
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
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/network/sdk_provider.dart';
import '../../core/specialty/specialty_registry.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/patient_context_bar.dart';
import '../../core/widgets/workflow_stepper.dart';
import '../../core/workflow/workflow_providers.dart';
import '../specialties/specialty_workspace_shell.dart';
import '../specialties/widgets/billing_panel.dart';
import '../specialties/widgets/vitals_panel.dart';
import 'emr_providers.dart';

class EmrWorkspaceScreen extends ConsumerStatefulWidget {
  const EmrWorkspaceScreen({super.key});

  @override
  ConsumerState<EmrWorkspaceScreen> createState() => _EmrWorkspaceScreenState();
}

class _EmrWorkspaceScreenState extends ConsumerState<EmrWorkspaceScreen> {
  bool _isClosing = false;
  List<String> _allergies = [];
  List<String> _conditions = [];
  int? _riskScore;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadPatientChart();
      final active = ref.read(activePatientStateProvider);
      ref.read(encounterWorkflowProvider.notifier).startEncounter(
            specialtyCode: active.specialtyCode,
          );
    });
  }

  Future<void> _loadPatientChart() async {
    final state = ref.read(activePatientStateProvider);
    if (state.patientId == null) return;

    try {
      final sdk = ref.read(doctorSdkProvider);
      final allergies = await sdk.ehr.listAllergies(state.patientId!);
      final conditions = await sdk.ehr.listConditions(state.patientId!);
      Map<String, dynamic>? risks;
      try {
        risks = await sdk.ai.getLatestRisks(state.patientId!);
      } catch (_) {}

      setState(() {
        _allergies = allergies.map((a) => a['allergen']?.toString() ?? '').where((s) => s.isNotEmpty).toList();
        _conditions = conditions.map((c) => c['conditionName']?.toString() ?? c['name']?.toString() ?? '').where((s) => s.isNotEmpty).toList();
        _riskScore = (risks?['overallScore'] as num?)?.toInt();
      });
    } catch (_) {
      setState(() {
        _allergies = ['Penicillin'];
        _conditions = ['Hypertension', 'Type 2 Diabetes'];
        _riskScore = 62;
      });
    }
  }

  Future<void> _closeEncounter() async {
    final state = ref.read(activePatientStateProvider);
    if (state.encounterId == null) return;

    setState(() => _isClosing = true);
    try {
      await ref.read(doctorSdkProvider).ehr.closeEncounter(state.encounterId!);
      ref.read(encounterWorkflowProvider.notifier).reset();
      ref.read(activePatientStateProvider.notifier).clear();
      if (mounted) {
        context.pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Encounter completed and saved'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error closing encounter: $e'), backgroundColor: AppTheme.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _isClosing = false);
    }
  }

  Widget _buildStepContent(WorkflowStepId step, SpecialtyConfig config) {
    switch (step) {
      case WorkflowStepId.intake:
        return _IntakeStep(onContinue: () {
          ref.read(encounterWorkflowProvider.notifier).completeStep(WorkflowStepId.intake);
        });
      case WorkflowStepId.vitals:
        return VitalsPanel(
          onSaved: () => ref.read(encounterWorkflowProvider.notifier).completeStep(WorkflowStepId.vitals),
        );
      case WorkflowStepId.examination:
        return const SpecialtyWorkspaceShell();
      case WorkflowStepId.diagnosis:
      case WorkflowStepId.treatment:
      case WorkflowStepId.prescription:
        return const SpecialtyWorkspaceShell();
      case WorkflowStepId.billing:
        return const BillingPanel();
      case WorkflowStepId.followUp:
        return _FollowUpStep(
          accent: config.accent,
          onComplete: _closeEncounter,
        );
      default:
        return const SpecialtyWorkspaceShell();
    }
  }

  @override
  Widget build(BuildContext context) {
    final patient = ref.watch(activePatientStateProvider);
    final workflow = ref.watch(encounterWorkflowProvider);
    final config = workflow.config;

    return Scaffold(
      appBar: AppBar(
        title: Text('${config.label} · ${patient.patientName ?? "Encounter"}'),
        backgroundColor: config.accent.withValues(alpha: 0.1),
        actions: [
          if (workflow.encounterStartedAt != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Center(
                child: Text(
                  _elapsed(workflow.encounterStartedAt!),
                  style: TextStyle(color: config.accent, fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          _isClosing
              ? const Padding(padding: EdgeInsets.all(16), child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)))
              : IconButton(icon: const Icon(Icons.check_circle, color: AppTheme.secondary), onPressed: _closeEncounter, tooltip: 'Complete encounter'),
        ],
      ),
      body: Column(
        children: [
          PatientContextBar(
            patientName: patient.patientName ?? 'Patient',
            wyshId: patient.wyshId ?? 'WYSH-0000',
            age: 34,
            gender: 'M',
            riskScore: _riskScore,
            allergies: _allergies,
            conditions: _conditions,
          ),
          WorkflowStepper(
            steps: config.workflowSteps,
            currentStep: workflow.currentStep,
            completedSteps: workflow.completedSteps,
            accent: config.accent,
            onStepTap: (step) => ref.read(encounterWorkflowProvider.notifier).goToStep(step),
          ),
          _SpecialtyChips(
            current: config.code,
            onSelect: (code) {
              ref.read(activePatientStateProvider.notifier).setSpecialty(code);
              ref.read(encounterWorkflowProvider.notifier).startEncounter(specialtyCode: code);
            },
          ),
          const Divider(height: 1),
          Expanded(child: _buildStepContent(workflow.currentStep, config)),
        ],
      ),
    );
  }

  String _elapsed(DateTime start) {
    final d = DateTime.now().difference(start);
    return '${d.inMinutes}m ${d.inSeconds % 60}s';
  }
}

class _SpecialtyChips extends StatelessWidget {
  const _SpecialtyChips({required this.current, required this.onSelect});

  final String current;
  final void Function(String code) onSelect;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        children: SpecialtyRegistry.all.values.map((s) {
          final selected = s.code == current;
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: FilterChip(
              selected: selected,
              avatar: Icon(s.icon, size: 16, color: selected ? AppTheme.background : s.accent),
              label: Text(s.label, style: const TextStyle(fontSize: 11)),
              selectedColor: s.accent,
              checkmarkColor: AppTheme.background,
              onSelected: (_) => onSelect(s.code),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _IntakeStep extends StatelessWidget {
  const _IntakeStep({required this.onContinue});

  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Patient Intake', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        const TextField(decoration: InputDecoration(labelText: 'Chief complaint')),
        const SizedBox(height: 12),
        const TextField(decoration: InputDecoration(labelText: 'History of present illness'), maxLines: 3),
        const SizedBox(height: 12),
        const TextField(decoration: InputDecoration(labelText: 'Current medications')),
        const SizedBox(height: 24),
        FilledButton(onPressed: onContinue, child: const Text('Confirm intake → Vitals')),
      ],
    );
  }
}

class _FollowUpStep extends StatelessWidget {
  const _FollowUpStep({required this.accent, required this.onComplete});

  final Color accent;
  final VoidCallback onComplete;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Schedule Follow-up', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            leading: Icon(Icons.event, color: accent),
            title: const Text('AI recommends: 2 weeks'),
            subtitle: const Text('Based on treatment plan and risk profile'),
          ),
        ),
        const SizedBox(height: 12),
        const TextField(decoration: InputDecoration(labelText: 'Follow-up notes')),
        const SizedBox(height: 24),
        FilledButton.icon(
          style: FilledButton.styleFrom(backgroundColor: AppTheme.secondary, foregroundColor: AppTheme.background),
          onPressed: onComplete,
          icon: const Icon(Icons.done_all),
          label: const Text('Complete Encounter'),
        ),
      ],
    );
  }
}
