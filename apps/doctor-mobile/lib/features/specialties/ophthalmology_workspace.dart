/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
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
 * Flutter/Dart module: ophthalmology_workspace
 *
 * Responsibilities:
 * - Implement doctor functionality in Flutter
 *
 * Used By:
 - apps/patient-mobile/lib/features/family/family_member_detail_screen.dart
 - apps/patient-mobile/lib/features/pharmacy/pharmacy_cart_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/patient-mobile/lib/features/settings/notification_prefs_screen.dart
 - apps/doctor-mobile/lib/core/widgets/patient_context_bar.dart
 - apps/doctor-mobile/lib/core/authentication/auth_notifier.dart
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
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/sdk_provider.dart';
import '../../core/theme/app_theme.dart';
import '../encounters/emr_providers.dart';

class OphthalmologyWorkspace extends ConsumerStatefulWidget {
  const OphthalmologyWorkspace({super.key});

  @override
  ConsumerState<OphthalmologyWorkspace> createState() => _OphthalmologyWorkspaceState();
}

class _OphthalmologyWorkspaceState extends ConsumerState<OphthalmologyWorkspace> {
  // Refraction OD (Right)
  double _odSph = 0.0;
  double _odCyl = 0.0;
  int _odAxis = 90;
  String _odAcuity = '20/20';

  // Refraction OS (Left)
  double _osSph = 0.0;
  double _osCyl = 0.0;
  int _osAxis = 90;
  String _osAcuity = '20/20';

  // Intraocular Pressure (IOP)
  double _odIop = 15.0;
  double _osIop = 15.0;

  // Selected quadrants findings
  final List<String> _eyeFindings = [];
  bool _isSaving = false;

  void _toggleFinding(String finding) {
    setState(() {
      if (_eyeFindings.contains(finding)) {
        _eyeFindings.remove(finding);
      } else {
        _eyeFindings.add(finding);
      }
    });
  }

  Future<void> _handleSave() async {
    final state = ref.read(activePatientStateProvider);
    if (state.encounterId == null) return;

    setState(() => _isSaving = true);
    try {
      final sdk = ref.read(doctorSdkProvider);

      await sdk.client.post('/specialties/ophthalmology/encounters', {
        'encounterId': state.encounterId,
        'patientId': state.patientId,
        'providerId': 'provider-id-1234',
        'data': {
          'refraction': {
            'od': {'sph': _odSph, 'cyl': _odCyl, 'axis': _odAxis, 'acuity': _odAcuity},
            'os': {'sph': _osSph, 'cyl': _osCyl, 'axis': _osAxis, 'acuity': _osAcuity},
          },
          'iop': {
            'od': _odIop,
            'os': _osIop,
          },
          'findings': _eyeFindings,
        },
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ophthalmology EMR details saved successfully!'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save Ophthalmology details: $e'), backgroundColor: AppTheme.danger),
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
          // Refraction Grid
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Refraction Assessment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _buildRefractionSection('Right Eye (OD)', true),
                  const SizedBox(height: 16),
                  const Divider(color: AppTheme.glassBorder),
                  const SizedBox(height: 16),
                  _buildRefractionSection('Left Eye (OS)', false),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // IOP Gauge
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Intraocular Pressure (IOP) Gauge', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Text('OD (Right Eye): ${_odIop.round()} mmHg', style: const TextStyle(fontSize: 13)),
                  Slider(
                    value: _odIop,
                    min: 5,
                    max: 40,
                    activeColor: AppTheme.primary,
                    onChanged: (val) => setState(() => _odIop = val),
                  ),
                  const SizedBox(height: 8),
                  Text('OS (Left Eye): ${_osIop.round()} mmHg', style: const TextStyle(fontSize: 13)),
                  Slider(
                    value: _osIop,
                    min: 5,
                    max: 40,
                    activeColor: AppTheme.secondary,
                    onChanged: (val) => setState(() => _osIop = val),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Eye Findings Checkbox list
          Card(
            color: AppTheme.surface,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Eye Segment Findings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      'Cataract',
                      'Macular Degeneration',
                      'Glaucomatous Cupping',
                      'Diabetic Retinopathy',
                      'Corneal Abrasion',
                      'Conjunctivitis',
                    ].map((f) {
                      final isSelected = _eyeFindings.contains(f);
                      return FilterChip(
                        label: Text(f),
                        selected: isSelected,
                        selectedColor: AppTheme.secondary.withOpacity(0.2),
                        checkmarkColor: AppTheme.secondary,
                        onSelected: (_) => _toggleFinding(f),
                      );
                    }).toList(),
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
            label: const Text('Save & Sync Ophthalmology Findings'),
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

  Widget _buildRefractionSection(String title, bool isOd) {
    final sph = isOd ? _odSph : _osSph;
    final cyl = isOd ? _odCyl : _osCyl;
    final axis = isOd ? _odAxis : _osAxis;
    final acuity = isOd ? _odAcuity : _osAcuity;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 14)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<double>(
                value: sph,
                decoration: const InputDecoration(labelText: 'Spherical', contentPadding: EdgeInsets.symmetric(horizontal: 8)),
                items: List.generate(41, (i) => (i - 20) * 0.25)
                    .map((val) => DropdownMenuItem(value: val, child: Text('${val >= 0 ? "+" : ""}$val')))
                    .toList(),
                onChanged: (val) => setState(() {
                  if (isOd) {
                    _odSph = val ?? 0.0;
                  } else {
                    _osSph = val ?? 0.0;
                  }
                }),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: DropdownButtonFormField<double>(
                value: cyl,
                decoration: const InputDecoration(labelText: 'Cylinder', contentPadding: EdgeInsets.symmetric(horizontal: 8)),
                items: List.generate(21, (i) => -i * 0.25)
                    .map((val) => DropdownMenuItem(value: val, child: Text('$val')))
                    .toList(),
                onChanged: (val) => setState(() {
                  if (isOd) {
                    _odCyl = val ?? 0.0;
                  } else {
                    _osCyl = val ?? 0.0;
                  }
                }),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextFormField(
                initialValue: '$axis',
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Axis', contentPadding: EdgeInsets.symmetric(horizontal: 8)),
                onChanged: (val) => setState(() {
                  final parsed = int.tryParse(val) ?? 90;
                  if (isOd) {
                    _odAxis = parsed;
                  } else {
                    _osAxis = parsed;
                  }
                }),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextFormField(
                initialValue: acuity,
                decoration: const InputDecoration(labelText: 'Acuity', contentPadding: EdgeInsets.symmetric(horizontal: 8)),
                onChanged: (val) => setState(() {
                  if (isOd) {
                    _odAcuity = val;
                  } else {
                    _osAcuity = val;
                  }
                }),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
