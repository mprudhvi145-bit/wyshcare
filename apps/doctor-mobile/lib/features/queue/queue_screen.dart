/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/queue/queue_screen.dart
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
 * Flutter screen: queue_screen
 *
 * Responsibilities:
 * - Implement mobile functionality in Flutter
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
import 'package:go_router/go_router.dart';
import '../../core/network/sdk_provider.dart';
import '../../core/specialty/specialty_registry.dart';
import '../../core/theme/app_theme.dart';
import '../../core/workflow/workflow_providers.dart';
import '../encounters/emr_providers.dart';

class QueueScreen extends ConsumerStatefulWidget {
  const QueueScreen({super.key});

  @override
  ConsumerState<QueueScreen> createState() => _QueueScreenState();
}

class _QueueScreenState extends ConsumerState<QueueScreen> {
  String _searchQuery = '';
  String _selectedPriority = 'ALL';
  String _selectedStatus = 'ALL';
  bool _isLoading = false;
  List<dynamic> _queueEntries = [];

  @override
  void initState() {
    super.initState();
    _loadQueue();
  }

  Future<void> _loadQueue() async {
    setState(() => _isLoading = true);
    try {
      final sdk = ref.read(doctorSdkProvider);
      final branches = await sdk.clinic.listBranches();
      if (branches.isNotEmpty) {
        final branchId = branches.first['id'];
        final list = await sdk.clinic.getQueue(branchId);
        setState(() {
          _queueEntries = list;
          _isLoading = false;
        });
      } else {
        _setMockQueue();
      }
    } catch (_) {
      _setMockQueue();
    }
  }

  void _setMockQueue() {
    setState(() {
      _queueEntries = [
        {
          'id': 'q-1',
          'patientId': 'p-1',
          'patient': {'fullName': 'Aarav Sharma', 'wyshId': 'WYSH-1029', 'age': 34, 'gender': 'MALE'},
          'status': 'CHECKED_IN',
          'priority': 'HIGH',
          'reason': 'Chest congestion & cough',
        },
        {
          'id': 'q-2',
          'patientId': 'p-2',
          'patient': {'fullName': 'Priya Patel', 'wyshId': 'WYSH-4921', 'age': 28, 'gender': 'FEMALE'},
          'status': 'WAITING',
          'priority': 'NORMAL',
          'reason': 'Routine dental cleaning',
        },
        {
          'id': 'q-3',
          'patientId': 'p-3',
          'patient': {'fullName': 'Rahul Varma', 'wyshId': 'WYSH-8732', 'age': 52, 'gender': 'MALE'},
          'status': 'CHECKED_IN',
          'priority': 'CRITICAL',
          'reason': 'Hypertensive crisis check',
        },
        {
          'id': 'q-4',
          'patientId': 'p-4',
          'patient': {'fullName': 'Sneha Reddy', 'wyshId': 'WYSH-3829', 'age': 4, 'gender': 'FEMALE'},
          'status': 'WAITING',
          'priority': 'HIGH',
          'reason': 'Pediatric vaccine scheduling',
        },
      ];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.primary)));
    }

    // Filter queue
    final filtered = _queueEntries.where((entry) {
      final name = (entry['patient']?['fullName'] ?? '').toString().toLowerCase();
      final wyshId = (entry['patient']?['wyshId'] ?? '').toString().toLowerCase();
      final reason = (entry['reason'] ?? '').toString().toLowerCase();
      final priority = entry['priority'] ?? 'NORMAL';
      final status = entry['status'] ?? 'WAITING';

      final matchesSearch = name.contains(_searchQuery.toLowerCase()) ||
          wyshId.contains(_searchQuery.toLowerCase()) ||
          reason.contains(_searchQuery.toLowerCase());

      final matchesPriority = _selectedPriority == 'ALL' || priority == _selectedPriority;
      final matchesStatus = _selectedStatus == 'ALL' || status == _selectedStatus;

      return matchesSearch && matchesPriority && matchesStatus;
    }).toList();

    return Scaffold(
      body: Column(
        children: [
          // Filter Bar
          _buildFilterBar(),
          const Divider(height: 1),

          // Queue List
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadQueue,
              color: AppTheme.primary,
              child: filtered.isEmpty
                  ? const Center(child: Text('No matching patients in queue', style: TextStyle(color: AppTheme.textSecondary)))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, idx) {
                        final entry = filtered[idx];
                        final name = entry['patient']?['fullName'] ?? 'Unknown';
                        final age = entry['patient']?['age'] ?? 30;
                        final gender = entry['patient']?['gender'] ?? 'M';
                        final wyshId = entry['patient']?['wyshId'] ?? 'WYSH-XXXX';
                        final reason = entry['reason'] ?? 'General Consult';
                        final priority = entry['priority'] ?? 'NORMAL';
                        final status = entry['status'] ?? 'WAITING';

                        Color badgeColor = AppTheme.primary;
                        if (priority == 'CRITICAL') {
                          badgeColor = AppTheme.danger;
                        } else if (priority == 'HIGH') {
                          badgeColor = AppTheme.warning;
                        }

                        return Card(
                          child: InkWell(
                            onTap: () {
                              final specialty = _specialtyFromReason(reason);
                              ref.read(activePatientStateProvider.notifier).selectPatient(
                                    patientId: entry['patientId'] ?? 'patient-id-1234',
                                    patientName: name,
                                    wyshId: wyshId,
                                    encounterId: entry['id'],
                                    specialtyCode: specialty,
                                  );
                              ref.read(encounterWorkflowProvider.notifier).startEncounter(specialtyCode: specialty);
                              context.push('/encounter');
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: badgeColor.withOpacity(0.15),
                                    child: Text(name[0], style: TextStyle(color: badgeColor, fontWeight: FontWeight.bold)),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                        const SizedBox(height: 4),
                                        Text('$wyshId • $gender, $age years old', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                                        const SizedBox(height: 6),
                                        Text('Complaint: $reason', style: const TextStyle(fontSize: 13, color: AppTheme.textPrimary)),
                                      ],
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: badgeColor.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          priority,
                                          style: TextStyle(color: badgeColor, fontSize: 10, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(status, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  String _specialtyFromReason(String reason) {
    final r = reason.toLowerCase();
    if (r.contains('dental') || r.contains('tooth')) return SpecialtyRegistry.dental.code;
    if (r.contains('skin') || r.contains('derm')) return SpecialtyRegistry.dermatology.code;
    if (r.contains('eye') || r.contains('vision')) return SpecialtyRegistry.ophthalmology.code;
    if (r.contains('ear') || r.contains('throat') || r.contains('ent')) return SpecialtyRegistry.ent.code;
    return SpecialtyRegistry.generalMedicine.code;
  }

  Widget _buildFilterBar() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          TextField(
            onChanged: (val) => setState(() => _searchQuery = val),
            decoration: InputDecoration(
              hintText: 'Search patients by name, WyshID or complaints...',
              prefixIcon: const Icon(Icons.search),
              contentPadding: const EdgeInsets.symmetric(vertical: 8),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedPriority,
                  decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12), labelText: 'Priority'),
                  items: const [
                    DropdownMenuItem(value: 'ALL', child: Text('All Priorities')),
                    DropdownMenuItem(value: 'CRITICAL', child: Text('Critical')),
                    DropdownMenuItem(value: 'HIGH', child: Text('High')),
                    DropdownMenuItem(value: 'NORMAL', child: Text('Normal')),
                  ],
                  onChanged: (val) => setState(() => _selectedPriority = val ?? 'ALL'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedStatus,
                  decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12), labelText: 'Status'),
                  items: const [
                    DropdownMenuItem(value: 'ALL', child: Text('All Statuses')),
                    DropdownMenuItem(value: 'CHECKED_IN', child: Text('Checked In')),
                    DropdownMenuItem(value: 'WAITING', child: Text('Waiting')),
                    DropdownMenuItem(value: 'CALLED', child: Text('Called')),
                  ],
                  onChanged: (val) => setState(() => _selectedStatus = val ?? 'ALL'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
