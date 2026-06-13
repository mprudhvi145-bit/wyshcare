/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/specialties/ent_workspace.dart
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
 * Flutter/Dart module: ent_workspace
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
import '../../core/network/sdk_provider.dart';
import '../../core/theme/app_theme.dart';
import '../encounters/emr_providers.dart';

class EntWorkspace extends ConsumerStatefulWidget {
  const EntWorkspace({super.key});

  @override
  ConsumerState<EntWorkspace> createState() => _EntWorkspaceState();
}

class _EntWorkspaceState extends ConsumerState<EntWorkspace> {
  String _selectedOrgan = 'EAR_LEFT';
  final Map<String, List<String>> _organFindings = {
    'EAR_LEFT': [],
    'EAR_RIGHT': [],
    'NOSE': [],
    'THROAT': [],
    'LARYNX': [],
  };

  // Audiogram sliders (dB hearing level at frequencies)
  double _leftHearingDb = 20.0;
  double _rightHearingDb = 20.0;
  bool _isSaving = false;

  void _toggleFinding(String organ, String finding) {
    setState(() {
      final list = _organFindings[organ]!;
      if (list.contains(finding)) {
        list.remove(finding);
      } else {
        list.add(finding);
      }
    });
  }

  Future<void> _handleSave() async {
    final state = ref.read(activePatientStateProvider);
    if (state.encounterId == null) return;

    setState(() => _isSaving = true);
    try {
      final sdk = ref.read(doctorSdkProvider);

      await sdk.client.post('/specialties/ent/encounters', {
        'encounterId': state.encounterId,
        'patientId': state.patientId,
        'providerId': 'provider-id-1234',
        'data': {
          'earLeftFindings': _organFindings['EAR_LEFT'],
          'earRightFindings': _organFindings['EAR_RIGHT'],
          'noseFindings': _organFindings['NOSE'],
          'throatFindings': _organFindings['THROAT'],
          'larynxFindings': _organFindings['LARYNX'],
          'audiometry': {
            'leftHearingDb': _leftHearingDb,
            'rightHearingDb': _rightHearingDb,
          }
        },
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('ENT findings saved successfully!'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save ENT findings: $e'), backgroundColor: AppTheme.danger),
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
          // Organ Interactive Map Stub
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text('Anatomical Region Selector', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    alignment: WrapAlignment.center,
                    children: [
                      _buildOrganButton('EAR_LEFT', 'Left Ear', Icons.hearing),
                      _buildOrganButton('EAR_RIGHT', 'Right Ear', Icons.hearing),
                      _buildOrganButton('NOSE', 'Nose Cavity', Icons.menu),
                      _buildOrganButton('THROAT', 'Oral Pharynx', Icons.mic),
                      _buildOrganButton('LARYNX', 'Larynx Voice', Icons.record_voice_over),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Findings Capture
          Card(
            color: AppTheme.surface,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Active Findings for $_selectedOrgan', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 12),
                  _buildFindingsList(),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Audiogram
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Audiometry Assessment (dB HL)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Text('Left Ear Threshold: ${_leftHearingDb.round()} dB', style: const TextStyle(fontSize: 13)),
                  Slider(
                    value: _leftHearingDb,
                    min: 0,
                    max: 100,
                    activeColor: AppTheme.primary,
                    onChanged: (val) => setState(() => _leftHearingDb = val),
                  ),
                  const SizedBox(height: 8),
                  Text('Right Ear Threshold: ${_rightHearingDb.round()} dB', style: const TextStyle(fontSize: 13)),
                  Slider(
                    value: _rightHearingDb,
                    min: 0,
                    max: 100,
                    activeColor: AppTheme.secondary,
                    onChanged: (val) => setState(() => _rightHearingDb = val),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Save
          ElevatedButton.icon(
            onPressed: _isSaving ? null : _handleSave,
            icon: const Icon(Icons.check_circle_outline),
            label: const Text('Save & Sync ENT Findings'),
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

  Widget _buildOrganButton(String organ, String label, IconData icon) {
    final isSelected = _selectedOrgan == organ;
    return ChoiceChip(
      avatar: Icon(icon, size: 16, color: isSelected ? AppTheme.background : AppTheme.primary),
      label: Text(label),
      selected: isSelected,
      selectedColor: AppTheme.primary,
      labelStyle: TextStyle(
        color: isSelected ? AppTheme.background : AppTheme.textPrimary,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      onSelected: (_) => setState(() => _selectedOrgan = organ),
    );
  }

  Widget _buildFindingsList() {
    final findings = _getFindingsForOrgan(_selectedOrgan);
    final activeList = _organFindings[_selectedOrgan]!;

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: findings.map((f) {
        final isSelected = activeList.contains(f);
        return FilterChip(
          label: Text(f),
          selected: isSelected,
          selectedColor: AppTheme.secondary.withValues(alpha: 0.2),
          checkmarkColor: AppTheme.secondary,
          onSelected: (_) => _toggleFinding(_selectedOrgan, f),
        );
      }).toList(),
    );
  }

  List<String> _getFindingsForOrgan(String organ) {
    if (organ.startsWith('EAR')) {
      return ['Congestion', 'Wax Impaction', 'Tympanic Perforation', 'Otitis Media', 'Fluid Effusion'];
    }
    if (organ == 'NOSE') {
      return ['Nasal Septum Deviation', 'Turbinate Hypertrophy', 'Nasal Polyp', 'Sinusitis Congestion', 'Epistaxis Bleeding'];
    }
    if (organ == 'THROAT') {
      return ['Tonsillar Hypertrophy', 'Pharyngeal Erythema', 'Exudate', 'Cobblestoning', 'Uvula Deviation'];
    }
    return ['Vocal Fold Nodule', 'Vocal Fold Polyp', 'Laryngitis Hemorrhage', 'Vocal Cord Paralysis'];
  }
}
