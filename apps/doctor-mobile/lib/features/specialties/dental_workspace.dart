/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/specialties/dental_workspace.dart
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
 * Flutter/Dart module: dental_workspace
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

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/sdk_provider.dart';
import '../../core/theme/app_theme.dart';
import '../encounters/emr_providers.dart';

class DentalWorkspace extends ConsumerStatefulWidget {
  const DentalWorkspace({super.key});

  @override
  ConsumerState<DentalWorkspace> createState() => _DentalWorkspaceState();
}

class _DentalWorkspaceState extends ConsumerState<DentalWorkspace> {
  // Store tooth conditions: {toothNumber: 'DECAYED' | 'MISSING' | 'FILLED' | 'CROWN' | 'HEALTHY'}
  final Map<int, String> _toothConditions = {};
  int? _selectedTooth;
  bool _isSaving = false;

  final List<int> _upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  final List<int> _lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  @override
  void initState() {
    super.initState();
    // Default all teeth to healthy
    for (final t in [..._upperTeeth, ..._lowerTeeth]) {
      _toothConditions[t] = 'HEALTHY';
    }
  }

  void _toggleToothCondition(int tooth, String condition) {
    setState(() {
      _toothConditions[tooth] = condition;
    });
  }

  Future<void> _handleSave() async {
    final state = ref.read(activePatientStateProvider);
    if (state.encounterId == null) return;

    setState(() => _isSaving = true);
    try {
      final sdk = ref.read(doctorSdkProvider);
      
      // Structure findings payload
      final toothMap = <String, dynamic>{};
      _toothConditions.forEach((tooth, cond) {
        if (cond != 'HEALTHY') {
          toothMap[tooth.toString()] = {
            'condition': cond,
            'procedures': cond == 'DECAYED' ? ['FILLED'] : [],
          };
        }
      });

      await sdk.client.post('/specialties/dental/encounters', body: {
        'encounterId': state.encounterId,
        'patientId': state.patientId,
        'providerId': 'provider-id-1234',
        'data': {
          'toothConditions': toothMap,
        },
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tooth chart findings saved successfully!'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save findings: $e'), backgroundColor: AppTheme.danger),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // FDI Tooth Chart
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text('FDI Dental Interactive Chart (32 Teeth)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 24),
                  
                  // Upper Arch
                  const Text('Upper Maxillary Arch', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                  const SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: _upperTeeth.map((t) => _buildToothWidget(t)).toList(),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Divider(color: AppTheme.glassBorder),
                  const SizedBox(height: 20),
                  
                  // Lower Arch
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: _lowerTeeth.map((t) => _buildToothWidget(t)).toList(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text('Lower Mandibular Arch', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Condition Selector
          if (_selectedTooth != null) ...[
            Card(
              color: AppTheme.surface,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Tooth #$_selectedTooth Diagnosis', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: ['HEALTHY', 'DECAYED', 'FILLED', 'MISSING', 'CROWN'].map((cond) {
                        final isSelected = _toothConditions[_selectedTooth] == cond;
                        return ChoiceChip(
                          label: Text(cond),
                          selected: isSelected,
                          selectedColor: _getConditionColor(cond).withOpacity(0.3),
                          labelStyle: TextStyle(
                            color: isSelected ? _getConditionColor(cond) : AppTheme.textSecondary,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                          onSelected: (_) => _toggleToothCondition(_selectedTooth!, cond),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Save Button
          ElevatedButton.icon(
            onPressed: _isSaving ? null : _handleSave,
            icon: const Icon(Icons.check_circle_outline),
            label: const Text('Save & Sync Dental Findings'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: AppTheme.background,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToothWidget(int tooth) {
    final isSelected = _selectedTooth == tooth;
    final condition = _toothConditions[tooth] ?? 'HEALTHY';
    final color = _getConditionColor(condition);

    return InkWell(
      onTap: () => setState(() => _selectedTooth = tooth),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.glassBorder : AppTheme.surface,
          border: Border.all(
            color: isSelected ? AppTheme.primary : color.withOpacity(0.5),
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(
              '$tooth',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isSelected ? AppTheme.primary : AppTheme.textPrimary,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 6),
            Icon(
              Icons.square,
              size: 16,
              color: color,
            ),
          ],
        ),
      ),
    );
  }

  Color _getConditionColor(String condition) {
    switch (condition) {
      case 'DECAYED':
        return AppTheme.danger;
      case 'FILLED':
        return AppTheme.secondary;
      case 'MISSING':
        return AppTheme.textMuted;
      case 'CROWN':
        return AppTheme.warning;
      case 'HEALTHY':
      default:
        return AppTheme.primary;
    }
  }
}
