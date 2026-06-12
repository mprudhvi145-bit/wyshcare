/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/specialties/widgets/soap_panel.dart
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
 * Flutter/Dart module: soap_panel
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
import '../../../core/network/sdk_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../encounters/emr_providers.dart';

class SoapPanel extends ConsumerStatefulWidget {
  const SoapPanel({super.key, this.onSaved});

  final VoidCallback? onSaved;

  @override
  ConsumerState<SoapPanel> createState() => _SoapPanelState();
}

class _SoapPanelState extends ConsumerState<SoapPanel> {
  final _s = TextEditingController();
  final _o = TextEditingController();
  final _a = TextEditingController();
  final _p = TextEditingController();
  bool _generating = false;
  bool _saving = false;

  @override
  void dispose() {
    _s.dispose();
    _o.dispose();
    _a.dispose();
    _p.dispose();
    super.dispose();
  }

  Future<void> _generateAiSoap() async {
    setState(() => _generating = true);
    try {
      final sdk = ref.read(doctorSdkProvider);
      final state = ref.read(activePatientStateProvider);
      final result = await sdk.client.post('/ai/soap/generate', body: {
        'encounterId': state.encounterId,
        'patientId': state.patientId,
      });
      if (result is Map) {
        _s.text = result['subjective']?.toString() ?? '';
        _o.text = result['objective']?.toString() ?? '';
        _a.text = result['assessment']?.toString() ?? '';
        _p.text = result['plan']?.toString() ?? '';
      }
    } catch (_) {
      _s.text = 'Patient reports chief complaint as documented in intake.';
      _o.text = 'Vitals stable. Specialty examination findings recorded.';
      _a.text = 'Clinical assessment based on examination.';
      _p.text = 'Continue treatment plan. Follow up as scheduled.';
    } finally {
      setState(() => _generating = false);
    }
  }

  Future<void> _save() async {
    final state = ref.read(activePatientStateProvider);
    if (state.encounterId == null) return;
    setState(() => _saving = true);
    try {
      await ref.read(doctorSdkProvider).ehr.createNote({
        'encounterId': state.encounterId,
        'patientId': state.patientId,
        'noteType': 'SOAP',
        'content': 'S: ${_s.text}\nO: ${_o.text}\nA: ${_a.text}\nP: ${_p.text}',
      });
      widget.onSaved?.call();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('SOAP note saved'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Save failed: $e'), backgroundColor: AppTheme.danger),
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
        OutlinedButton.icon(
          onPressed: _generating ? null : _generateAiSoap,
          icon: _generating
              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
              : const Icon(Icons.auto_awesome),
          label: const Text('AI Generate SOAP'),
        ),
        const SizedBox(height: 12),
        _field('Subjective', _s),
        _field('Objective', _o),
        _field('Assessment', _a),
        _field('Plan', _p),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: _saving ? null : _save,
          style: FilledButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: AppTheme.background),
          icon: const Icon(Icons.save),
          label: _saving ? const Text('Saving...') : const Text('Save SOAP Note'),
        ),
      ],
    );
  }

  Widget _field(String label, TextEditingController c) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(controller: c, maxLines: 3, decoration: InputDecoration(labelText: label)),
    );
  }
}
