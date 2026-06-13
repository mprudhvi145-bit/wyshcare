/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/specialties/specialty_workspace_shell.dart
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
 * Flutter/Dart module: specialty_workspace_shell
 *
 * Responsibilities:
 * - Implement doctor functionality in Flutter
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

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/specialty/specialty_registry.dart';
import '../../core/theme/app_theme.dart';
import '../../core/workflow/workflow_providers.dart';
import 'dental_workspace.dart';
import 'dermatology_workspace.dart';
import 'ent_workspace.dart';
import 'general_medicine_workspace.dart';
import 'ophthalmology_workspace.dart';
import 'widgets/billing_panel.dart';
import 'widgets/soap_panel.dart';
import 'widgets/vitals_panel.dart';

class SpecialtyWorkspaceShell extends ConsumerStatefulWidget {
  const SpecialtyWorkspaceShell({super.key});

  @override
  ConsumerState<SpecialtyWorkspaceShell> createState() => _SpecialtyWorkspaceShellState();
}

class _SpecialtyWorkspaceShellState extends ConsumerState<SpecialtyWorkspaceShell>
    with SingleTickerProviderStateMixin {
  TabController? _tabController;

  @override
  void dispose() {
    _tabController?.dispose();
    super.dispose();
  }

  void _syncController(SpecialtyConfig config, int index) {
    if (_tabController == null || _tabController!.length != config.examinationTabs.length) {
      _tabController?.dispose();
      _tabController = TabController(
        length: config.examinationTabs.length,
        vsync: this,
        initialIndex: index.clamp(0, config.examinationTabs.length - 1),
      );
      _tabController!.addListener(() {
        if (!_tabController!.indexIsChanging) {
          ref.read(encounterWorkflowProvider.notifier).setExaminationTab(_tabController!.index);
        }
      });
    } else if (_tabController!.index != index) {
      _tabController!.animateTo(index.clamp(0, config.examinationTabs.length - 1));
    }
  }

  @override
  Widget build(BuildContext context) {
    final workflow = ref.watch(encounterWorkflowProvider);
    final config = workflow.config;
    _syncController(config, workflow.examinationTabIndex);

    return Column(
      children: [
        Material(
          color: config.accent.withValues(alpha: 0.08),
          child: TabBar(
            controller: _tabController,
            isScrollable: true,
            indicatorColor: config.accent,
            labelColor: config.accent,
            unselectedLabelColor: AppTheme.textMuted,
            tabs: config.examinationTabs.map((t) => Tab(text: t)).toList(),
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: config.examinationTabs.map((tab) => _buildTab(tab, config.code)).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildTab(String tabLabel, String specialtyCode) {
    final tab = tabLabel.toLowerCase();

    if (tab.contains('soap')) {
      return SoapPanel(
        onSaved: () => ref.read(encounterWorkflowProvider.notifier).completeStep(WorkflowStepId.diagnosis),
      );
    }
    if (tab.contains('billing')) {
      return const BillingPanel();
    }
    if (tab.contains('vital')) {
      return VitalsPanel(
        onSaved: () => ref.read(encounterWorkflowProvider.notifier).completeStep(WorkflowStepId.vitals),
      );
    }

    return _specialtyBody(specialtyCode, tab);
  }

  Widget _specialtyBody(String code, String tab) {
    if (tab.contains('radiograph') || tab.contains('treatment')) {
      return const DentalWorkspace();
    }
    return switch (code) {
      'dental' => const DentalWorkspace(),
      'ent' => const EntWorkspace(),
      'dermatology' => const DermatologyWorkspace(),
      'ophthalmology' => const OphthalmologyWorkspace(),
      _ => const GeneralMedicineWorkspace(),
    };
  }
}
