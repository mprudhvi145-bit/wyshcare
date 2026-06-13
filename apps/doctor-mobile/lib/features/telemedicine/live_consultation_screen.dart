/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
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
 * Flutter screen: live_consultation_screen
 *
 * Responsibilities:
 * - Implement mobile functionality in Flutter
 *
 * Used By:
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/family/family_member_detail_screen.dart
 - apps/patient-mobile/lib/features/pharmacy/pharmacy_cart_screen.dart
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
Mobile
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

class LiveConsultationScreen extends ConsumerStatefulWidget {
  final String appointmentId;
  final String patientName;

  const LiveConsultationScreen({
    super.key,
    required this.appointmentId,
    required this.patientName,
  });

  @override
  ConsumerState<LiveConsultationScreen> createState() => _LiveConsultationScreenState();
}

class _LiveConsultationScreenState extends ConsumerState<LiveConsultationScreen> {
  bool _isMuted = false;
  bool _isVideoOff = false;
  
  final _subjectiveController = TextEditingController();
  final _objectiveController = TextEditingController();
  final _assessmentController = TextEditingController();
  final _planController = TextEditingController();
  
  final List<Map<String, String>> _prescribedDrugs = [];
  final _drugNameController = TextEditingController();
  final _dosageController = TextEditingController();
  final _frequencyController = TextEditingController();
  final _durationController = TextEditingController();

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
    super.dispose();
  }

  void _addDrug() {
    final name = _drugNameController.text.trim();
    if (name.isEmpty) return;
    setState(() {
      _prescribedDrugs.add({
        'drugName': name,
        'dosage': _dosageController.text.trim(),
        'frequency': _frequencyController.text.trim(),
        'duration': _durationController.text.trim(),
      });
      _drugNameController.clear();
      _dosageController.clear();
      _frequencyController.clear();
      _durationController.clear();
    });
  }

  Future<void> _handleCompleteConsultation() async {
    // Show saving state
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
    );

    try {
      final sdk = ref.read(doctorSdkProvider);
      
      // 1. Create Patient Encounter on the backend
      final encounter = await sdk.ehr.createEncounter({
        'patientUserId': 'patient-id-1234',
        'status': 'IN_PROGRESS',
        'type': 'TELEMEDICINE',
      });

      final encounterId = encounter['id'] as String;

      // 2. Save SOAP Note
      await sdk.ehr.createNote('patient-id-1234', {
        'noteType': 'SOAP',
        'content': 'Subjective: ${_subjectiveController.text}\nObjective: ${_objectiveController.text}\nAssessment: ${_assessmentController.text}\nPlan: ${_planController.text}',
      });

      // 3. Save Prescription if items exist
      if (_prescribedDrugs.isNotEmpty) {
        await sdk.prescriptions.create({
          'patientUserId': 'patient-id-1234',
          'consultationId': widget.appointmentId,
          'status': 'ISSUED',
          'items': _prescribedDrugs,
        });
      }

      // 4. Close the active encounter
      await sdk.ehr.closeEncounter(encounterId);

      if (mounted) {
        Navigator.pop(context); // Dismiss loading dialog
        Navigator.pop(context); // Exit consultation room
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Consultation completed and EMR saved successfully!'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Dismiss loading dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving encounter details: $e'), backgroundColor: AppTheme.danger),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final isTablet = media.size.width >= 720;

    final videoFeed = Container(
      color: Colors.black87,
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (!_isVideoOff)
            Positioned.fill(
              child: Opacity(
                opacity: 0.6,
                child: Image.network(
                  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.person, size: 80, color: AppTheme.textMuted)),
                ),
              ),
            )
          else
            const Center(
              child: Text('Camera Off', style: TextStyle(color: Colors.white, fontSize: 18)),
            ),
          
          // Patient video overlay top right
          Positioned(
            top: 16,
            right: 16,
            width: 110,
            height: 150,
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.glassBorder),
              ),
              child: const Center(
                child: Icon(Icons.camera_alt, color: AppTheme.textMuted),
              ),
            ),
          ),
          
          // Controls
          Positioned(
            bottom: 24,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircleAvatar(
                  backgroundColor: _isMuted ? AppTheme.danger : Colors.white30,
                  radius: 26,
                  child: IconButton(
                    icon: Icon(_isMuted ? Icons.mic_off : Icons.mic, color: Colors.white),
                    onPressed: () => setState(() => _isMuted = !_isMuted),
                  ),
                ),
                const SizedBox(width: 16),
                CircleAvatar(
                  backgroundColor: _isVideoOff ? AppTheme.danger : Colors.white30,
                  radius: 26,
                  child: IconButton(
                    icon: Icon(_isVideoOff ? Icons.videocam_off : Icons.videocam, color: Colors.white),
                    onPressed: () => setState(() => _isVideoOff = !_isVideoOff),
                  ),
                ),
                const SizedBox(width: 16),
                CircleAvatar(
                  backgroundColor: AppTheme.danger,
                  radius: 26,
                  child: IconButton(
                    icon: const Icon(Icons.call_end, color: Colors.white),
                    onPressed: _handleCompleteConsultation,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );

    final ehrWorkspace = DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            indicatorColor: AppTheme.primary,
            labelColor: AppTheme.primary,
            unselectedLabelColor: AppTheme.textSecondary,
            tabs: [
              Tab(text: 'SOAP Notes'),
              Tab(text: 'Prescription'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                // SOAP
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _buildSoapField('Subjective Notes', _subjectiveController),
                    const SizedBox(height: 12),
                    _buildSoapField('Objective Notes', _objectiveController),
                    const SizedBox(height: 12),
                    _buildSoapField('Assessment', _assessmentController),
                    const SizedBox(height: 12),
                    _buildSoapField('Treatment Plan', _planController),
                  ],
                ),
                // Prescription
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text('Current Prescription Items', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    if (_prescribedDrugs.isEmpty)
                      const Text('No medications added yet', style: TextStyle(color: AppTheme.textMuted, fontSize: 13))
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _prescribedDrugs.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 4),
                        itemBuilder: (context, idx) {
                          final drug = _prescribedDrugs[idx];
                          return Card(
                            color: AppTheme.surface,
                            child: ListTile(
                              title: Text(drug['drugName']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('${drug['dosage']} • ${drug['frequency']} • ${drug['duration']}'),
                              trailing: IconButton(
                                icon: const Icon(Icons.delete, color: AppTheme.danger, size: 18),
                                onPressed: () => setState(() => _prescribedDrugs.removeAt(idx)),
                              ),
                            ),
                          );
                        },
                      ),
                    const SizedBox(height: 20),
                    const Divider(),
                    const SizedBox(height: 12),
                    Text('Add Medication', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 12),
                    TextField(controller: _drugNameController, decoration: const InputDecoration(labelText: 'Drug Name (e.g. Paracetamol)')),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(child: TextField(controller: _dosageController, decoration: const InputDecoration(labelText: 'Dosage'))),
                        const SizedBox(width: 8),
                        Expanded(child: TextField(controller: _frequencyController, decoration: const InputDecoration(labelText: 'Frequency'))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextField(controller: _durationController, decoration: const InputDecoration(labelText: 'Duration (e.g. 5 days)')),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _addDrug,
                      icon: const Icon(Icons.add),
                      label: const Text('Add to Prescription'),
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: AppTheme.background),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );

    return Scaffold(
      appBar: AppBar(
        title: Text('Consultation: ${widget.patientName}'),
      ),
      body: isTablet
          ? Row(
              children: [
                Expanded(flex: 3, child: videoFeed),
                const VerticalDivider(width: 1),
                Expanded(flex: 2, child: Container(color: AppTheme.surface, child: ehrWorkspace)),
              ],
            )
          : Column(
              children: [
                Expanded(flex: 2, child: videoFeed),
                Expanded(flex: 3, child: Container(color: AppTheme.surface, child: ehrWorkspace)),
              ],
            ),
    );
  }

  Widget _buildSoapField(String label, TextEditingController controller) {
    return TextField(
      controller: controller,
      maxLines: 3,
      decoration: InputDecoration(
        labelText: label,
        alignLabelWithHint: true,
      ),
    );
  }
}
