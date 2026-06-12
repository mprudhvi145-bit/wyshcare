/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/core/widgets/workflow_stepper.dart
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
 * Flutter/Dart module: workflow_stepper
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

import 'package:flutter/material.dart';
import '../specialty/specialty_registry.dart';
import '../theme/app_theme.dart';

class WorkflowStepper extends StatelessWidget {
  const WorkflowStepper({
    super.key,
    required this.steps,
    required this.currentStep,
    required this.completedSteps,
    required this.accent,
    this.onStepTap,
  });

  final List<WorkflowStepDef> steps;
  final WorkflowStepId currentStep;
  final Set<WorkflowStepId> completedSteps;
  final Color accent;
  final void Function(WorkflowStepId)? onStepTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 72,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        itemCount: steps.length,
        separatorBuilder: (_, __) => Icon(Icons.chevron_right, size: 16, color: AppTheme.textMuted.withValues(alpha: 0.5)),
        itemBuilder: (context, idx) {
          final step = steps[idx];
          final isCurrent = step.id == currentStep;
          final isDone = completedSteps.contains(step.id);

          return InkWell(
            onTap: onStepTap != null ? () => onStepTap!(step.id) : null,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: 72,
              padding: const EdgeInsets.symmetric(vertical: 6),
              decoration: BoxDecoration(
                color: isCurrent ? accent.withValues(alpha: 0.15) : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                border: isCurrent ? Border.all(color: accent) : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isDone ? Icons.check_circle : step.icon,
                    size: 20,
                    color: isDone ? AppTheme.secondary : (isCurrent ? accent : AppTheme.textMuted),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    step.label,
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                      color: isCurrent ? accent : AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
