/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/core/navigation/router.dart
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
 * Flutter/Dart module: router
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
import 'package:go_router/go_router.dart';
import '../authentication/auth_notifier.dart';
import '../../features/auth/login_screen.dart';
import '../../features/dashboard/main_shell.dart';
import '../../features/encounters/emr_workspace_screen.dart';
import '../../features/telemedicine/live_consultation_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final status = authState.status;
      final goingToLogin = state.matchedLocation == '/login';

      if (status == AuthStatus.initial) return null;

      if (status == AuthStatus.unauthenticated || status == AuthStatus.error) {
        return goingToLogin ? null : '/login';
      }

      if (status == AuthStatus.authenticated && goingToLogin) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/', builder: (_, __) => const MainShell()),
      GoRoute(path: '/queue', redirect: (_, __) => '/'),
      GoRoute(path: '/encounter', builder: (_, __) => const EmrWorkspaceScreen()),
      GoRoute(
        path: '/telemedicine/:appointmentId',
        builder: (_, s) => LiveConsultationScreen(
          appointmentId: s.pathParameters['appointmentId']!,
          patientName: s.uri.queryParameters['name'] ?? 'Patient',
        ),
      ),
    ],
  );
});
