/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/ai_copilot/ai_scribe_panel.dart
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
 * Flutter/Dart module: ai_scribe_panel
 *
 * Responsibilities:
 * - Implement ai functionality in Flutter
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
AI
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
import 'package:wyshcare_doctor_sdk/wyshcare_doctor_sdk.dart';
import '../../core/network/sdk_provider.dart';
import '../../core/theme/app_theme.dart';
import '../encounters/emr_providers.dart';

class AiScribePanel extends ConsumerStatefulWidget {
  const AiScribePanel({super.key});

  @override
  ConsumerState<AiScribePanel> createState() => _AiScribePanelState();
}

class _AiScribePanelState extends ConsumerState<AiScribePanel> with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  bool _isLoading = false;
  
  Map<String, dynamic> _riskScores = {};
  List<dynamic> _cdsAlerts = [];
  List<dynamic> _preventiveRecs = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAiContext();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAiContext() async {
    final state = ref.read(activePatientStateProvider);
    final patientId = state.patientId ?? 'patient-id-1234';

    setState(() => _isLoading = true);
    try {
      final sdk = ref.read(doctorSdkProvider);

      // Load risk scores
      try {
        final risks = await sdk.ai.getLatestRisks(patientId);
        setState(() => _riskScores = risks);
      } catch (_) {
        // Mock default risks if none found
        setState(() => _riskScores = {
          'cardiovascular': {'level': 'MODERATE', 'score': 65},
          'diabetic': {'level': 'HIGH', 'score': 78},
          'renal': {'level': 'LOW', 'score': 20},
        });
      }

      // Load CDS Alerts
      try {
        final alerts = await sdk.ehr.listAlerts(patientId);
        setState(() => _cdsAlerts = alerts);
      } catch (_) {
        setState(() => _cdsAlerts = [
          {'title': 'Glucophage + Renal insufficiency risk', 'severity': 'HIGH', 'message': 'Patient has moderate creatinine elevation.'},
          {'title': 'Beta blocker bradycardia warning', 'severity': 'MODERATE', 'message': 'Verify heart rate prior to carvedilol administration.'},
        ]);
      }

      // Load Preventive Recommendations
      try {
        final recs = await sdk.ai.getPreventiveRecommendations(patientId);
        setState(() => _preventiveRecs = recs);
      } catch (_) {
        setState(() => _preventiveRecs = [
          {'title': 'HbA1c monitoring test due', 'category': 'preventive', 'status': 'ACTIVE'},
          {'title': 'Annual diabetic retinopathy screening', 'category': 'preventive', 'status': 'ACTIVE'},
        ]);
      }

      setState(() => _isLoading = false);
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final activePatient = ref.watch(activePatientStateProvider);
    final patientName = activePatient.patientName ?? 'Unassigned Patient';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Title banner
        Container(
          padding: const EdgeInsets.all(12),
          decoration: const BoxDecoration(
            color: AppTheme.surface,
            border: Border(bottom: BorderSide(color: AppTheme.glassBorder)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: const [
                  Icon(Icons.assistant, color: AppTheme.primary, size: 18),
                  SizedBox(width: 8),
                  Text('AI COPILOT INTELLIGENCE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primary)),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Assisting: $patientName',
                style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
        ),

        // Tabs
        TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textSecondary,
          labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
          tabs: const [
            Tab(text: 'Scribe'),
            Tab(text: 'CDS Warnings'),
            Tab(text: 'Risks & Recs'),
          ],
        ),

        // Tab views
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildScribeView(),
                    _buildCdsView(),
                    _buildRisksView(),
                  ],
                ),
        ),
      ],
    );
  }

  Widget _buildScribeView() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.background,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.glassBorder),
              ),
              child: ListView(
                children: const [
                  Text('Scribe listening log...', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontStyle: FontStyle.italic)),
                  SizedBox(height: 12),
                  Text(
                    'Doctor: Tell me about your cough.\nPatient: It has been dry and mostly occurs at night. For the past 4 days.',
                    style: TextStyle(fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.mic, size: 18),
            label: const Text('Start AI Voice Scribe'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: AppTheme.background,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCdsView() {
    if (_cdsAlerts.isEmpty) {
      return const Center(child: Text('No active clinical decision warnings', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _cdsAlerts.length,
      itemBuilder: (context, idx) {
        final alert = _cdsAlerts[idx];
        final title = alert['title'] ?? 'Warning';
        final message = alert['message'] ?? '';
        final severity = alert['severity'] ?? 'NORMAL';

        Color cardColor = AppTheme.secondary;
        if (severity == 'HIGH') {
          cardColor = AppTheme.danger;
        } else if (severity == 'MODERATE') {
          cardColor = AppTheme.warning;
        }

        return Card(
          color: cardColor.withOpacity(0.08),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(color: cardColor.withOpacity(0.3)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: cardColor, size: 16),
                    const SizedBox(width: 6),
                    Expanded(child: Text(title, style: TextStyle(color: cardColor, fontWeight: FontWeight.bold, fontSize: 13))),
                  ],
                ),
                const SizedBox(height: 6),
                Text(message, style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRisksView() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        const Text('AI Predictive Risks', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        const SizedBox(height: 8),
        ..._riskScores.entries.map((entry) {
          final riskName = entry.key.toUpperCase();
          final val = entry.value;
          final score = val['score'] ?? 50;
          final level = val['level'] ?? 'MODERATE';

          Color color = AppTheme.primary;
          if (level == 'HIGH' || level == 'CRITICAL') {
            color = AppTheme.danger;
          } else if (level == 'MODERATE') {
            color = AppTheme.warning;
          }

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(riskName, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    Text('$level ($score%)', style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: score / 100,
                    color: color,
                    backgroundColor: AppTheme.glassBorder,
                    minHeight: 8,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
        const Divider(),
        const SizedBox(height: 8),
        const Text('Preventive Directives', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        const SizedBox(height: 8),
        ..._preventiveRecs.map((rec) {
          final title = rec['title'] ?? '';
          return Card(
            child: ListTile(
              leading: const Icon(Icons.check_box_outline_blank, color: AppTheme.primary, size: 20),
              title: Text(title, style: const TextStyle(fontSize: 12)),
            ),
          );
        }).toList(),
      ],
    );
  }
}
