/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/specialties/dermatology_workspace.dart
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
 * Flutter/Dart module: dermatology_workspace
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

class LesionPin {
  final double x;
  final double y;
  final String region;
  final String description;
  final String lesionType; // 'MACULE' | 'PAPULE' | 'NODULE' | 'ULCER'

  LesionPin({
    required this.x,
    required this.y,
    required this.region,
    required this.description,
    required this.lesionType,
  });

  Map<String, dynamic> toJson() => {
        'x': x,
        'y': y,
        'region': region,
        'description': description,
        'lesionType': lesionType,
      };
}

class DermatologyWorkspace extends ConsumerStatefulWidget {
  const DermatologyWorkspace({super.key});

  @override
  ConsumerState<DermatologyWorkspace> createState() => _DermatologyWorkspaceState();
}

class _DermatologyWorkspaceState extends ConsumerState<DermatologyWorkspace> {
  final List<LesionPin> _pins = [];
  bool _isSaving = false;
  
  final _regionController = TextEditingController();
  final _descController = TextEditingController();
  String _selectedType = 'PAPULE';

  @override
  void dispose() {
    _regionController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _addPin(Offset localPosition, double containerWidth, double containerHeight) {
    // Drop pin at coordinates and open dialog
    _regionController.clear();
    _descController.clear();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Lesion Pin'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<String>(
              value: _selectedType,
              items: const [
                DropdownMenuItem(value: 'PAPULE', child: Text('Papule')),
                DropdownMenuItem(value: 'MACULE', child: Text('Macule')),
                DropdownMenuItem(value: 'NODULE', child: Text('Nodule')),
                DropdownMenuItem(value: 'ULCER', child: Text('Ulcer')),
              ],
              onChanged: (val) => setState(() => _selectedType = val ?? 'PAPULE'),
              decoration: const InputDecoration(labelText: 'Lesion Type'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _regionController,
              decoration: const InputDecoration(labelText: 'Anatomical Region (e.g. Left Forearm)'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Description (size, color, borders)'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (_regionController.text.isNotEmpty) {
                setState(() {
                  _pins.add(
                    LesionPin(
                      x: localPosition.dx / containerWidth,
                      y: localPosition.dy / containerHeight,
                      region: _regionController.text.trim(),
                      description: _descController.text.trim(),
                      lesionType: _selectedType,
                    ),
                  );
                });
              }
              Navigator.pop(context);
            },
            child: const Text('Add Pin'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleSave() async {
    final state = ref.read(activePatientStateProvider);
    if (state.encounterId == null) return;

    setState(() => _isSaving = true);
    try {
      final sdk = ref.read(doctorSdkProvider);

      await sdk.client.post('/specialties/dermatology/encounters', {
        'encounterId': state.encounterId,
        'patientId': state.patientId,
        'providerId': 'provider-id-1234',
        'data': {
          'lesionPins': _pins.map((p) => p.toJson()).toList(),
        },
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Dermatology findings saved successfully!'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save Dermatology findings: $e'), backgroundColor: AppTheme.danger),
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
          // Body Map Interaction
          const Text('Tap on Body Map area to drop lesion pins', style: TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
          const SizedBox(height: 12),
          
          LayoutBuilder(
            builder: (context, constraints) {
              final width = constraints.maxWidth;
              final height = 300.0;
              return GestureDetector(
                onTapUp: (details) => _addPin(details.localPosition, width, height),
                child: Container(
                  height: height,
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.glassBorder),
                  ),
                  child: Stack(
                    children: [
                      // Body outline graphics simulated with simple icons
                      Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: const [
                            Icon(Icons.accessibility_new, size: 200, color: AppTheme.glassBorder),
                            Icon(Icons.accessibility, size: 200, color: AppTheme.glassBorder),
                          ],
                        ),
                      ),
                      
                      // Render pins
                      ..._pins.map((pin) {
                        Color pinColor = AppTheme.primary;
                        if (pin.lesionType == 'MACULE') pinColor = AppTheme.secondary;
                        if (pin.lesionType == 'NODULE') pinColor = AppTheme.warning;
                        if (pin.lesionType == 'ULCER') pinColor = AppTheme.danger;

                        return Positioned(
                          left: pin.x * width - 12,
                          top: pin.y * height - 12,
                          child: Icon(
                            Icons.location_on,
                            color: pinColor,
                            size: 24,
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 16),

          // Pins List
          Card(
            color: AppTheme.surface,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Active Lesion Pins', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 12),
                  if (_pins.isEmpty)
                    const Text('No pins placed yet. Tap body outline above.', style: TextStyle(color: AppTheme.textMuted, fontSize: 13))
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _pins.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 6),
                      itemBuilder: (context, idx) {
                        final pin = _pins[idx];
                        return ListTile(
                          leading: Icon(Icons.location_on, color: pin.lesionType == 'ULCER' ? AppTheme.danger : AppTheme.primary),
                          title: Text('${pin.lesionType} - ${pin.region}'),
                          subtitle: Text(pin.description),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete, color: AppTheme.danger, size: 18),
                            onPressed: () => setState(() => _pins.removeAt(idx)),
                          ),
                        );
                      },
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
            label: const Text('Save & Sync Dermatology Pins'),
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
}
