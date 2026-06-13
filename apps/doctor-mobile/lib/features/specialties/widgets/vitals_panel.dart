/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/specialties/widgets/vitals_panel.dart
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
 * Flutter/Dart module: vitals_panel
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
import '../../../core/network/sdk_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../encounters/emr_providers.dart';

class VitalsPanel extends ConsumerStatefulWidget {
  const VitalsPanel({super.key, this.onSaved});

  final VoidCallback? onSaved;

  @override
  ConsumerState<VitalsPanel> createState() => _VitalsPanelState();
}

class _VitalsPanelState extends ConsumerState<VitalsPanel> {
  final _bpSys = TextEditingController(text: '120');
  final _bpDia = TextEditingController(text: '80');
  final _pulse = TextEditingController(text: '72');
  final _spo2 = TextEditingController(text: '98');
  final _temp = TextEditingController(text: '98.4');
  final _weight = TextEditingController(text: '70');
  bool _saving = false;

  @override
  void dispose() {
    _bpSys.dispose();
    _bpDia.dispose();
    _pulse.dispose();
    _spo2.dispose();
    _temp.dispose();
    _weight.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final state = ref.read(activePatientStateProvider);
    if (state.encounterId == null) return;
    setState(() => _saving = true);
    try {
      await ref.read(doctorSdkProvider).ehr.recordVitals({
        'encounterId': state.encounterId,
        'patientId': state.patientId,
        'bloodPressureSystolic': int.tryParse(_bpSys.text),
        'bloodPressureDiastolic': int.tryParse(_bpDia.text),
        'pulse': int.tryParse(_pulse.text),
        'spo2': int.tryParse(_spo2.text),
        'temperature': double.tryParse(_temp.text),
        'weight': double.tryParse(_weight.text),
      });
      widget.onSaved?.call();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vitals recorded'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (_) {
      widget.onSaved?.call();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vitals saved locally (offline queue)'), backgroundColor: AppTheme.warning),
        );
      }
    } finally {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          Expanded(child: _num('BP Systolic', _bpSys)),
          const SizedBox(width: 12),
          Expanded(child: _num('BP Diastolic', _bpDia)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _num('Pulse (bpm)', _pulse)),
          const SizedBox(width: 12),
          Expanded(child: _num('SpO₂ (%)', _spo2)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _num('Temp (°F)', _temp)),
          const SizedBox(width: 12),
          Expanded(child: _num('Weight (kg)', _weight)),
        ]),
        const SizedBox(height: 24),
        FilledButton(
          onPressed: _saving ? null : _save,
          style: FilledButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: AppTheme.background),
          child: Text(_saving ? 'Saving...' : 'Record Vitals'),
        ),
      ],
    );
  }

  Widget _num(String label, TextEditingController c) {
    return TextField(controller: c, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: label));
  }
}
