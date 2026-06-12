/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/features/onboarding/profile_setup_screen.dart
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
 * Flutter screen: profile_setup_screen
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

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final _nameController = TextEditingController();
  String? _gender;
  DateTime? _dob;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Complete your profile')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full name')),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _gender,
            decoration: const InputDecoration(labelText: 'Gender'),
            items: const [
              DropdownMenuItem(value: 'male', child: Text('Male')),
              DropdownMenuItem(value: 'female', child: Text('Female')),
              DropdownMenuItem(value: 'other', child: Text('Other')),
            ],
            onChanged: (v) => setState(() => _gender = v),
          ),
          const SizedBox(height: 16),
          ListTile(
            title: const Text('Date of birth'),
            subtitle: Text(_dob?.toString().split(' ').first ?? 'Select date'),
            trailing: const Icon(Icons.calendar_today),
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: DateTime(1990),
                firstDate: DateTime(1920),
                lastDate: DateTime.now(),
              );
              if (picked != null) setState(() => _dob = picked);
            },
          ),
          const SizedBox(height: 32),
          FilledButton(
            onPressed: () => context.go('/onboarding/abha'),
            style: FilledButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: AppTheme.background),
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }
}
