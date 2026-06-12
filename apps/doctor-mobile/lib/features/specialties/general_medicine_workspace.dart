/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/specialties/general_medicine_workspace.dart
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
 * Flutter/Dart module: general_medicine_workspace
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

class GeneralMedicineWorkspace extends ConsumerStatefulWidget {
  const GeneralMedicineWorkspace({super.key});

  @override
  ConsumerState<GeneralMedicineWorkspace> createState() => _GeneralMedicineWorkspaceState();
}

class _GeneralMedicineWorkspaceState extends ConsumerState<GeneralMedicineWorkspace> {
  final _subjectiveController = TextEditingController();
  final _objectiveController = TextEditingController();
  final _assessmentController = TextEditingController();
  final _planController = TextEditingController();

  final List<Map<String, String>> _prescribedDrugs = [];
  final _drugNameController = TextEditingController();
  final _dosageController = TextEditingController();
  final _frequencyController = TextEditingController();
  final _durationController = TextEditingController();

  final List<String> _diagnoses = [];
  final _diagnosisController = TextEditingController();

  bool _isSaving = false;
  List<dynamic> _drugSearchResults = [];
  bool _isSearchingDrugs = false;

  @override
  void dispose() {
    _subjectiveController.dispose();
    _objectiveController.dispose();
    _assessmentController.dispose();
    _planController.dispose();
    _drugNameController.dispose();
    _dosageController.dispose();
    _frequencyController.dispose();
    _durationController.dispose();
    _diagnosisController.dispose();
    super.dispose();
  }

  Future<void> _searchDrugs(String query) async {
    if (query.length < 2) {
      setState(() => _drugSearchResults = []);
      return;
    }
    setState(() => _isSearchingDrugs = true);
    try {
      final sdk = ref.read(doctorSdkProvider);
      final results = await sdk.prescriptions.searchDrugs(query);
      setState(() {
        _drugSearchResults = results;
        _isSearchingDrugs = false;
      });
    } catch (_) {
      setState(() => _isSearchingDrugs = false);
    }
  }

  void _addDrug(String name) {
    setState(() {
      _prescribedDrugs.add({
        'drugName': name,
        'dosage': _dosageController.text.trim().isEmpty ? '500mg' : _dosageController.text.trim(),
        'frequency': _frequencyController.text.trim().isEmpty ? '1-0-1' : _frequencyController.text.trim(),
        'duration': _durationController.text.trim().isEmpty ? '5 days' : _durationController.text.trim(),
      });
      _drugNameController.clear();
      _dosageController.clear();
      _frequencyController.clear();
      _durationController.clear();
      _drugSearchResults = [];
    });
  }

  void _addDiagnosis() {
    final text = _diagnosisController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _diagnoses.add(text);
      _diagnosisController.clear();
    });
  }

  Future<void> _handleSave() async {
    final state = ref.read(activePatientStateProvider);
    if (state.encounterId == null) return;

    setState(() => _isSaving = true);
    try {
      final sdk = ref.read(doctorSdkProvider);

      // Save SOAP Note
      await sdk.ehr.createNote({
        'encounterId': state.encounterId,
        'patientId': state.patientId,
        'noteType': 'SOAP',
        'content': 'Subjective: ${_subjectiveController.text}\nObjective: ${_objectiveController.text}\nAssessment: ${_assessmentController.text}\nPlan: ${_planController.text}',
      });

      // Save Diagnoses
      for (final diag in _diagnoses) {
        await sdk.ehr.addDiagnosis({
          'encounterId': state.encounterId,
          'patientId': state.patientId,
          'code': 'ICD-10',
          'name': diag,
        });
      }

      // Save Prescription
      if (_prescribedDrugs.isNotEmpty) {
        await sdk.prescriptions.create({
          'patientUserId': state.patientId,
          'consultationId': state.encounterId,
          'status': 'ISSUED',
          'items': _prescribedDrugs,
        });
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('General Medicine EMR saved successfully!'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save General Medicine EMR: $e'), backgroundColor: AppTheme.danger),
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
          // SOAP Notes Section
          Text('Clinical SOAP Workspace', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          _buildSoapField('Subjective (Complaints, History)', _subjectiveController),
          const SizedBox(height: 12),
          _buildSoapField('Objective (Vitals, Lab reviews)', _objectiveController),
          const SizedBox(height: 12),
          _buildSoapField('Assessment (Clinical Judgement)', _assessmentController),
          const SizedBox(height: 12),
          _buildSoapField('Plan (Treatment, Referrals)', _planController),
          const SizedBox(height: 24),

          // Diagnoses Section
          Text('Diagnosis Registry (ICD-10)', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _diagnosisController,
                  decoration: const InputDecoration(hintText: 'Search/Type Diagnosis (e.g. Acute Tonsillitis)'),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.add_circle, color: AppTheme.primary, size: 36),
                onPressed: _addDiagnosis,
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_diagnoses.isNotEmpty)
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _diagnoses.map((diag) {
                return Chip(
                  label: Text(diag),
                  deleteIcon: const Icon(Icons.close, size: 16),
                  onDeleted: () => setState(() => _diagnoses.remove(diag)),
                );
              }).toList(),
            ),
          const SizedBox(height: 24),

          // Prescription Section
          Text('Prescription Console', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          _buildPrescriptionBuilder(),
          const SizedBox(height: 24),

          // Save Button
          ElevatedButton.icon(
            onPressed: _isSaving ? null : _handleSave,
            icon: const Icon(Icons.save),
            label: const Text('Save & Sync General Medicine Workspace'),
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

  Widget _buildSoapField(String label, TextEditingController controller) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: TextField(
          controller: controller,
          maxLines: 3,
          decoration: InputDecoration(
            labelText: label,
            alignLabelWithHint: true,
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
          ),
        ),
      ),
    );
  }

  Widget _buildPrescriptionBuilder() {
    return Card(
      color: AppTheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // List of currently added drugs
            if (_prescribedDrugs.isNotEmpty) ...[
              const Text('Active Prescription Items', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _prescribedDrugs.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (context, idx) {
                  final drug = _prescribedDrugs[idx];
                  return ListTile(
                    title: Text(drug['drugName']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${drug['dosage']} • ${drug['frequency']} • ${drug['duration']}'),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete, color: AppTheme.danger, size: 20),
                      onPressed: () => setState(() => _prescribedDrugs.removeAt(idx)),
                    ),
                  );
                },
              ),
              const Divider(),
              const SizedBox(height: 12),
            ],

            // Search drug input
            TextField(
              controller: _drugNameController,
              onChanged: _searchDrugs,
              decoration: const InputDecoration(
                hintText: 'Search drug database (Paracetamol, Amoxicillin...)',
                prefixIcon: Icon(Icons.search),
              ),
            ),
            if (_isSearchingDrugs)
              const LinearProgressIndicator(color: AppTheme.primary),
            
            // Search Results overlay list
            if (_drugSearchResults.isNotEmpty)
              Container(
                constraints: const BoxConstraints(maxHeight: 150),
                decoration: BoxDecoration(
                  color: AppTheme.background,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.glassBorder),
                ),
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _drugSearchResults.length,
                  itemBuilder: (context, idx) {
                    final item = _drugSearchResults[idx];
                    final name = item['name'] ?? item['genericName'] ?? '';
                    return ListTile(
                      title: Text(name),
                      onTap: () => _addDrug(name),
                    );
                  },
                ),
              ),
            const SizedBox(height: 12),

            // Dosing helper fields
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _dosageController,
                    decoration: const InputDecoration(labelText: 'Dosage (e.g. 500mg)'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextFormField(
                    controller: _frequencyController,
                    decoration: const InputDecoration(labelText: 'Frequency (e.g. 1-0-1)'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _durationController,
              decoration: const InputDecoration(labelText: 'Duration (e.g. 5 days)'),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                final name = _drugNameController.text.trim();
                if (name.isNotEmpty) {
                  _addDrug(name);
                }
              },
              icon: const Icon(Icons.add),
              label: const Text('Add Drug Item'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: AppTheme.background,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
