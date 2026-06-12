/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/features/billing/billing_screen.dart
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
 * Flutter screen: billing_screen
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
import '../../core/theme/app_theme.dart';

class BillingScreen extends ConsumerWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Revenue Summary
            _buildRevenueHeader(context),
            const SizedBox(height: 24),

            // Invoices List
            const Text('Recent Invoices', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
            const SizedBox(height: 12),
            _buildInvoiceItem('INV-2026-003', 'Aarav Sharma', '₹1,500', 'PAID', AppTheme.secondary),
            _buildInvoiceItem('INV-2026-002', 'Priya Patel', '₹2,200', 'PENDING', AppTheme.warning),
            _buildInvoiceItem('INV-2026-001', 'Rahul Varma', '₹800', 'PAID', AppTheme.secondary),
          ],
        ),
      ),
    );
  }

  Widget _buildRevenueHeader(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('TODAY\'S REVENUE', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('₹4,500.00', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.primary)),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSubStat('Paid Invoices', '2', AppTheme.secondary),
                _buildSubStat('Pending Claims', '1', AppTheme.warning),
                _buildSubStat('Settled Claims', '₹18,000', AppTheme.primary),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubStat(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
      ],
    );
  }

  Widget _buildInvoiceItem(String id, String patient, String amount, String status, Color statusColor) {
    return Card(
      child: ListTile(
        title: Text(patient, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Invoice ID: $id'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textPrimary)),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                status,
                style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
