/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/specialties/widgets/billing_panel.dart
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
 * Flutter/Dart module: billing_panel
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

class BillingPanel extends ConsumerStatefulWidget {
  const BillingPanel({super.key, this.procedureItems = const []});

  final List<Map<String, dynamic>> procedureItems;

  @override
  ConsumerState<BillingPanel> createState() => _BillingPanelState();
}

class _BillingPanelState extends ConsumerState<BillingPanel> {
  bool _generating = false;
  final List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    _items.addAll(widget.procedureItems);
    if (_items.isEmpty) {
      _items.addAll([
        {'name': 'Consultation Fee', 'code': 'CONSULT', 'amount': 500},
        {'name': 'Procedure / Treatment', 'code': 'PROC', 'amount': 1200},
      ]);
    }
  }

  double get _total => _items.fold(0.0, (sum, i) => sum + ((i['amount'] as num?)?.toDouble() ?? 0));

  Future<void> _generateInvoice() async {
    final state = ref.read(activePatientStateProvider);
    if (state.encounterId == null || state.patientId == null) return;
    setState(() => _generating = true);
    try {
      await ref.read(doctorSdkProvider).client.post('/billing/invoices', {
        'encounterId': state.encounterId,
        'patientId': state.patientId,
        'items': _items,
        'total': _total,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invoice generated — ₹${_total.toStringAsFixed(0)}'), backgroundColor: AppTheme.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Billing error: $e'), backgroundColor: AppTheme.danger),
        );
      }
    } finally {
      setState(() => _generating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ..._items.map((item) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(item['name']?.toString() ?? 'Item'),
                subtitle: Text('Code: ${item['code']}'),
                trailing: Text('₹${item['amount']}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
              ),
            )),
        const Divider(),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('₹${_total.toStringAsFixed(0)}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.secondary)),
          ],
        ),
        const SizedBox(height: 16),
        const ListTile(
          leading: Icon(Icons.shield, color: AppTheme.accent),
          title: Text('Insurance coverage'),
          subtitle: Text('Star Health — 80% eligible'),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: _generating ? null : _generateInvoice,
          style: FilledButton.styleFrom(backgroundColor: AppTheme.secondary, foregroundColor: AppTheme.background, padding: const EdgeInsets.symmetric(vertical: 16)),
          icon: const Icon(Icons.receipt),
          label: Text(_generating ? 'Generating...' : 'Generate Invoice'),
        ),
      ],
    );
  }
}
