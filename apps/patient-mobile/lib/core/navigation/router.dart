/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/core/navigation/router.dart
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
 * - Implement patient functionality in Flutter
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
Patient
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
import '../../features/ai_twin/ai_twin_ask_screen.dart';
import '../../features/ai_twin/ai_twin_dashboard_screen.dart';
import '../../features/ai_twin/ai_twin_risks_screen.dart';
import '../../features/ai_twin/ai_twin_trends_screen.dart';
import '../../features/appointments/appointment_detail_screen.dart';
import '../../features/appointments/appointments_screen.dart';
import '../../features/appointments/booking_screen.dart';
import '../../features/appointments/telemedicine_room_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/verify_otp_screen.dart';
import '../../features/care/care_hub_screen.dart';
import '../../features/diagnostics/diagnostics_booking_screen.dart';
import '../../features/diagnostics/diagnostics_order_detail_screen.dart';
import '../../features/diagnostics/diagnostics_screen.dart';
import '../../features/discover/discover_screen.dart';
import '../../features/discover/doctor_profile_screen.dart';
import '../../features/family/add_family_member_screen.dart';
import '../../features/family/family_member_detail_screen.dart';
import '../../features/family/family_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/insurance/insurance_claim_detail_screen.dart';
import '../../features/insurance/insurance_screen.dart';
import '../../features/onboarding/abha_link_screen.dart';
import '../../features/onboarding/profile_setup_screen.dart';
import '../../features/onboarding/splash_screen.dart';
import '../../features/pharmacy/pharmacy_cart_screen.dart';
import '../../features/pharmacy/pharmacy_checkout_screen.dart';
import '../../features/pharmacy/pharmacy_home_screen.dart';
import '../../features/pharmacy/pharmacy_order_detail_screen.dart';
import '../../features/pharmacy/pharmacy_orders_screen.dart';
import '../../features/pharmacy/pharmacy_partner_screen.dart';
import '../../features/pharmacy/pharmacy_search_screen.dart';
import '../../features/prescriptions/prescription_detail_screen.dart';
import '../../features/prescriptions/prescriptions_screen.dart';
import '../../features/records/record_detail_screen.dart';
import '../../features/records/record_upload_screen.dart';
import '../../features/records/records_screen.dart';
import '../../features/settings/emergency_profile_screen.dart';
import '../../features/settings/notification_prefs_screen.dart';
import '../../features/settings/security_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/shell/main_shell.dart';
import '../../features/timeline/timeline_detail_screen.dart';
import '../../features/timeline/timeline_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final loc = state.matchedLocation;
      final isPublic = loc == '/' ||
          loc == '/login' ||
          loc == '/verify' ||
          loc.startsWith('/onboarding');

      if (auth.status == AuthStatus.initial) return null;

      if (auth.status != AuthStatus.authenticated && !isPublic) {
        return '/login';
      }

      if (auth.status == AuthStatus.authenticated &&
          (loc == '/login' || loc == '/verify')) {
        return auth.needsOnboarding ? '/onboarding/profile' : '/home';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/verify', builder: (_, __) => const VerifyOtpScreen()),
      GoRoute(path: '/onboarding/profile', builder: (_, __) => const ProfileSetupScreen()),
      GoRoute(path: '/onboarding/abha', builder: (_, __) => const AbhaLinkScreen()),

      ShellRoute(
        builder: (context, state, child) => MainShell(location: state.matchedLocation, child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/timeline', builder: (_, __) => const TimelineScreen()),
          GoRoute(path: '/care', builder: (_, __) => const CareHubScreen()),
          GoRoute(path: '/pharmacy', builder: (_, __) => const PharmacyHomeScreen()),
          GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
        ],
      ),

      GoRoute(path: '/timeline/:id', builder: (_, s) => TimelineDetailScreen(entryId: s.pathParameters['id']!)),
      GoRoute(path: '/records', builder: (_, __) => const RecordsScreen()),
      GoRoute(path: '/records/upload', builder: (_, __) => const RecordUploadScreen()),
      GoRoute(path: '/records/:id', builder: (_, s) => RecordDetailScreen(recordId: s.pathParameters['id']!)),
      GoRoute(path: '/prescriptions', builder: (_, __) => const PrescriptionsScreen()),
      GoRoute(path: '/prescriptions/:id', builder: (_, s) => PrescriptionDetailScreen(prescriptionId: s.pathParameters['id']!)),
      GoRoute(path: '/appointments', builder: (_, __) => const AppointmentsScreen()),
      GoRoute(path: '/appointments/book', builder: (_, __) => const BookingScreen()),
      GoRoute(path: '/appointments/:id/join', builder: (_, s) => TelemedicineRoomScreen(appointmentId: s.pathParameters['id']!)),
      GoRoute(path: '/appointments/:id', builder: (_, s) => AppointmentDetailScreen(appointmentId: s.pathParameters['id']!)),
      GoRoute(path: '/discover', builder: (_, __) => const DiscoverScreen()),
      GoRoute(path: '/discover/:id', builder: (_, s) => DoctorProfileScreen(doctorId: s.pathParameters['id']!)),
      GoRoute(path: '/diagnostics', builder: (_, __) => const DiagnosticsScreen()),
      GoRoute(path: '/diagnostics/book', builder: (_, __) => const DiagnosticsBookingScreen()),
      GoRoute(path: '/diagnostics/orders/:id', builder: (_, s) => DiagnosticsOrderDetailScreen(orderId: s.pathParameters['id']!)),
      GoRoute(path: '/pharmacy/search', builder: (_, __) => const PharmacySearchScreen()),
      GoRoute(path: '/pharmacy/partners/:id', builder: (_, s) => PharmacyPartnerScreen(partnerId: s.pathParameters['id']!)),
      GoRoute(path: '/pharmacy/cart', builder: (_, __) => const PharmacyCartScreen()),
      GoRoute(path: '/pharmacy/checkout', builder: (_, __) => const PharmacyCheckoutScreen()),
      GoRoute(path: '/pharmacy/orders', builder: (_, __) => const PharmacyOrdersScreen()),
      GoRoute(path: '/pharmacy/orders/:id', builder: (_, s) => PharmacyOrderDetailScreen(orderId: s.pathParameters['id']!)),
      GoRoute(path: '/ai-twin', builder: (_, __) => const AiTwinDashboardScreen()),
      GoRoute(path: '/ai-twin/ask', builder: (_, __) => const AiTwinAskScreen()),
      GoRoute(path: '/ai-twin/risks', builder: (_, __) => const AiTwinRisksScreen()),
      GoRoute(path: '/ai-twin/trends', builder: (_, __) => const AiTwinTrendsScreen()),
      GoRoute(path: '/family', builder: (_, __) => const FamilyScreen()),
      GoRoute(path: '/family/add', builder: (_, __) => const AddFamilyMemberScreen()),
      GoRoute(path: '/family/:id', builder: (_, s) => FamilyMemberDetailScreen(memberId: s.pathParameters['id']!)),
      GoRoute(path: '/insurance', builder: (_, __) => const InsuranceScreen()),
      GoRoute(path: '/insurance/claims/:id', builder: (_, s) => InsuranceClaimDetailScreen(claimId: s.pathParameters['id']!)),
      GoRoute(path: '/settings/security', builder: (_, __) => const SecurityScreen()),
      GoRoute(path: '/settings/notifications', builder: (_, __) => const NotificationPrefsScreen()),
      GoRoute(path: '/settings/emergency', builder: (_, __) => const EmergencyProfileScreen()),
    ],
  );
});
