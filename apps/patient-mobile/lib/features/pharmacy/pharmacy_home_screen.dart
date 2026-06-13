/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/pharmacy/pharmacy_home_screen.dart
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
 * Flutter screen: pharmacy_home_screen
 *
 * Responsibilities:
 * - Implement mobile functionality in Flutter
 *
 * Used By:
 - apps/patient-mobile/lib/features/family/family_member_detail_screen.dart
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/pharmacy/pharmacy_cart_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/patient-mobile/lib/features/settings/notification_prefs_screen.dart
 - apps/doctor-mobile/lib/core/widgets/patient_context_bar.dart
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
library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/widgets/feature_screen.dart';

class PharmacyHomeScreen extends StatelessWidget {
  const PharmacyHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(
          decoration: const InputDecoration(hintText: 'Search medicines...', prefixIcon: Icon(Icons.search)),
          onTap: () => context.push('/pharmacy/search'),
          readOnly: true,
        ),
        const SizedBox(height: 16),
        SectionCard(title: 'Upload prescription', subtitle: 'Order from your Rx', icon: Icons.upload_file, onTap: () => context.push('/prescriptions')),
        SectionCard(title: 'Apollo Pharmacy', subtitle: '2.1 km · 30 min delivery', icon: Icons.store, onTap: () => context.push('/pharmacy/partners/apollo')),
        SectionCard(title: 'My orders', subtitle: 'Track deliveries', icon: Icons.local_shipping, onTap: () => context.push('/pharmacy/orders')),
        SectionCard(title: 'Cart', subtitle: '2 items', icon: Icons.shopping_cart, onTap: () => context.push('/pharmacy/cart')),
      ],
    );
  }
}
