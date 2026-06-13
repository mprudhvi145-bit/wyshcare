/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/core/specialty/specialty_registry.dart
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
 * Flutter/Dart module: specialty_registry
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
import '../../core/theme/app_theme.dart';

enum WorkflowStepId {
  intake,
  vitals,
  examination,
  diagnosis,
  treatment,
  prescription,
  billing,
  followUp,
}

class WorkflowStepDef {
  final WorkflowStepId id;
  final String label;
  final IconData icon;

  const WorkflowStepDef({required this.id, required this.label, required this.icon});
}

class SpecialtyMetricDef {
  final String label;
  final IconData icon;
  final String apiHint;

  const SpecialtyMetricDef({required this.label, required this.icon, required this.apiHint});
}

class SpecialtyQuickAction {
  final String label;
  final IconData icon;
  final String route;

  const SpecialtyQuickAction({required this.label, required this.icon, required this.route});
}

class SpecialtyConfig {
  final String code;
  final String label;
  final String tagline;
  final IconData icon;
  final Color accent;
  final List<WorkflowStepDef> workflowSteps;
  final List<SpecialtyMetricDef> metrics;
  final List<SpecialtyQuickAction> quickActions;
  final List<String> examinationTabs;

  const SpecialtyConfig({
    required this.code,
    required this.label,
    required this.tagline,
    required this.icon,
    required this.accent,
    required this.workflowSteps,
    required this.metrics,
    required this.quickActions,
    required this.examinationTabs,
  });
}

const _defaultWorkflow = [
  WorkflowStepDef(id: WorkflowStepId.intake, label: 'Intake', icon: Icons.person_search),
  WorkflowStepDef(id: WorkflowStepId.vitals, label: 'Vitals', icon: Icons.monitor_heart),
  WorkflowStepDef(id: WorkflowStepId.examination, label: 'Exam', icon: Icons.medical_information),
  WorkflowStepDef(id: WorkflowStepId.diagnosis, label: 'Diagnosis', icon: Icons.biotech),
  WorkflowStepDef(id: WorkflowStepId.treatment, label: 'Treatment', icon: Icons.healing),
  WorkflowStepDef(id: WorkflowStepId.prescription, label: 'Rx', icon: Icons.medication),
  WorkflowStepDef(id: WorkflowStepId.billing, label: 'Billing', icon: Icons.receipt_long),
  WorkflowStepDef(id: WorkflowStepId.followUp, label: 'Follow-up', icon: Icons.event),
];

class SpecialtyRegistry {
  static const generalMedicine = SpecialtyConfig(
    code: 'general-medicine',
    label: 'General Medicine',
    tagline: 'SOAP, vitals, and longitudinal care',
    icon: Icons.medical_services,
    accent: AppTheme.primary,
    workflowSteps: _defaultWorkflow,
    metrics: [
      SpecialtyMetricDef(label: 'Patients Today', icon: Icons.people, apiHint: '/clinic/queue'),
      SpecialtyMetricDef(label: 'Chronic Cases', icon: Icons.favorite, apiHint: '/patients/chronic'),
      SpecialtyMetricDef(label: 'Pending Labs', icon: Icons.science, apiHint: '/lab-orders'),
      SpecialtyMetricDef(label: 'Telehealth', icon: Icons.videocam, apiHint: '/telemedicine/appointments'),
    ],
    quickActions: [
      SpecialtyQuickAction(label: 'Start Consult', icon: Icons.play_arrow, route: '/queue'),
      SpecialtyQuickAction(label: 'Write Rx', icon: Icons.medication, route: '/encounter'),
      SpecialtyQuickAction(label: 'Lab Order', icon: Icons.biotech, route: '/encounter'),
      SpecialtyQuickAction(label: 'AI Copilot', icon: Icons.assistant, route: '/encounter'),
    ],
    examinationTabs: ['SOAP', 'Vitals', 'Diagnosis', 'Rx'],
  );

  static const dental = SpecialtyConfig(
    code: 'dental',
    label: 'Dental OS',
    tagline: 'FDI chart, radiographs, treatment plans',
    icon: Icons.health_and_safety,
    accent: Color(0xFF5AC8FA),
    workflowSteps: _defaultWorkflow,
    metrics: [
      SpecialtyMetricDef(label: 'Chair Queue', icon: Icons.chair, apiHint: '/clinic/queue'),
      SpecialtyMetricDef(label: 'Procedures Today', icon: Icons.construction, apiHint: '/specialties/dental/procedures'),
      SpecialtyMetricDef(label: 'Pending X-Rays', icon: Icons.image, apiHint: '/imaging/studies'),
      SpecialtyMetricDef(label: 'Treatment Plans', icon: Icons.assignment, apiHint: '/specialties/dental/treatment-plans'),
    ],
    quickActions: [
      SpecialtyQuickAction(label: 'Tooth Chart', icon: Icons.grid_on, route: '/encounter'),
      SpecialtyQuickAction(label: 'Radiograph', icon: Icons.photo_camera, route: '/encounter'),
      SpecialtyQuickAction(label: 'Treatment Plan', icon: Icons.list_alt, route: '/encounter'),
      SpecialtyQuickAction(label: 'Generate Invoice', icon: Icons.payments, route: '/billing'),
    ],
    examinationTabs: ['Tooth Chart', 'Radiographs', 'Treatment', 'SOAP', 'Billing'],
  );

  static const ent = SpecialtyConfig(
    code: 'ent',
    label: 'ENT',
    tagline: 'Ear, nose, throat & audiometry',
    icon: Icons.hearing,
    accent: Color(0xFFAF52DE),
    workflowSteps: _defaultWorkflow,
    metrics: [
      SpecialtyMetricDef(label: 'ENT Queue', icon: Icons.people, apiHint: '/clinic/queue'),
      SpecialtyMetricDef(label: 'Audiograms', icon: Icons.graphic_eq, apiHint: '/specialties/ent/audiometry'),
      SpecialtyMetricDef(label: 'Endoscopy', icon: Icons.visibility, apiHint: '/specialties/ent/endoscopy'),
      SpecialtyMetricDef(label: 'Surgery Referrals', icon: Icons.local_hospital, apiHint: '/referrals'),
    ],
    quickActions: [
      SpecialtyQuickAction(label: 'Organ Exam', icon: Icons.hearing, route: '/encounter'),
      SpecialtyQuickAction(label: 'Audiogram', icon: Icons.equalizer, route: '/encounter'),
      SpecialtyQuickAction(label: 'Nasal Scope', icon: Icons.search, route: '/encounter'),
      SpecialtyQuickAction(label: 'Surgery Refer', icon: Icons.send, route: '/encounter'),
    ],
    examinationTabs: ['Organ Map', 'Audiometry', 'Findings', 'SOAP'],
  );

  static const dermatology = SpecialtyConfig(
    code: 'dermatology',
    label: 'Dermatology',
    tagline: 'Body map lesions & dermoscopy',
    icon: Icons.face,
    accent: Color(0xFFFF9500),
    workflowSteps: _defaultWorkflow,
    metrics: [
      SpecialtyMetricDef(label: 'Derm Queue', icon: Icons.people, apiHint: '/clinic/queue'),
      SpecialtyMetricDef(label: 'Lesion Pins', icon: Icons.location_on, apiHint: '/specialties/dermatology/lesions'),
      SpecialtyMetricDef(label: 'Biopsies Pending', icon: Icons.science, apiHint: '/lab-orders'),
      SpecialtyMetricDef(label: 'Follow-ups', icon: Icons.calendar_month, apiHint: '/schedule'),
    ],
    quickActions: [
      SpecialtyQuickAction(label: 'Body Map', icon: Icons.accessibility_new, route: '/encounter'),
      SpecialtyQuickAction(label: 'Dermoscopy', icon: Icons.camera_alt, route: '/encounter'),
      SpecialtyQuickAction(label: 'Biopsy Order', icon: Icons.biotech, route: '/encounter'),
      SpecialtyQuickAction(label: 'Topical Rx', icon: Icons.medication_liquid, route: '/encounter'),
    ],
    examinationTabs: ['Body Map', 'Lesions', 'Photos', 'SOAP', 'Rx'],
  );

  static const ophthalmology = SpecialtyConfig(
    code: 'ophthalmology',
    label: 'Ophthalmology',
    tagline: 'Refraction, IOP & fundus exam',
    icon: Icons.remove_red_eye,
    accent: Color(0xFF34C759),
    workflowSteps: _defaultWorkflow,
    metrics: [
      SpecialtyMetricDef(label: 'Eye Clinic Queue', icon: Icons.people, apiHint: '/clinic/queue'),
      SpecialtyMetricDef(label: 'Refractions', icon: Icons.visibility, apiHint: '/specialties/ophthalmology/refraction'),
      SpecialtyMetricDef(label: 'High IOP Alerts', icon: Icons.warning, apiHint: '/ai/risk/alerts'),
      SpecialtyMetricDef(label: 'Cataract Pipeline', icon: Icons.lens, apiHint: '/specialties/ophthalmology/surgery'),
    ],
    quickActions: [
      SpecialtyQuickAction(label: 'Refraction', icon: Icons.remove_red_eye, route: '/encounter'),
      SpecialtyQuickAction(label: 'IOP Check', icon: Icons.speed, route: '/encounter'),
      SpecialtyQuickAction(label: 'Fundus Photo', icon: Icons.camera, route: '/encounter'),
      SpecialtyQuickAction(label: 'Glasses Rx', icon: Icons.visibility, route: '/encounter'),
    ],
    examinationTabs: ['Refraction', 'IOP', 'Fundus', 'Findings', 'SOAP'],
  );

  static final Map<String, SpecialtyConfig> all = {
    generalMedicine.code: generalMedicine,
    dental.code: dental,
    ent.code: ent,
    dermatology.code: dermatology,
    ophthalmology.code: ophthalmology,
  };

  static SpecialtyConfig resolve(String? code) => all[code] ?? generalMedicine;

  static String? codeFromSpecialization(String name) {
    final n = name.toLowerCase();
    if (n.contains('dental') || n.contains('dentist')) return dental.code;
    if (n.contains('ent') || n.contains('otolaryng')) return ent.code;
    if (n.contains('dermat')) return dermatology.code;
    if (n.contains('ophthal') || n.contains('eye')) return ophthalmology.code;
    if (n.contains('general') || n.contains('physician') || n.contains('medicine')) {
      return generalMedicine.code;
    }
    return null;
  }

  static String primaryCodeFromProfile(List<String> specializations) {
    for (final s in specializations) {
      final code = codeFromSpecialization(s);
      if (code != null) return code;
    }
    return generalMedicine.code;
  }
}
