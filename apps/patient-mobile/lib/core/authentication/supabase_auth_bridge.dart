/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/core/authentication/supabase_auth_bridge.dart
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
 * Flutter/Dart module: supabase_auth_bridge
 *
 * Responsibilities:
 * - Implement authentication functionality in Flutter
 *
 * Used By:
 - apps/patient-mobile/lib/core/network/sdk_provider.dart
 - apps/patient-mobile/lib/core/authentication/auth_notifier.dart
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
Authentication
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

import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:wyshcare_patient_sdk/wyshcare_patient_sdk.dart';
import '../config/app_config.dart';

/// Bridges Supabase Auth sessions into WyshCare NestJS API tokens.
class SupabaseAuthBridge {
  SupabaseAuthBridge(this._tokenStorage);

  final TokenStorage _tokenStorage;

  static Future<void> initialize() async {
    if (!AppConfig.hasSupabase) return;
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      anonKey: AppConfig.supabaseAnonKey,
    );
  }

  static bool get isEnabled => AppConfig.hasSupabase;

  SupabaseClient? get client =>
      isEnabled ? Supabase.instance.client : null;

  Future<void> requestPhoneOtp(String phone) async {
    final supabase = client;
    if (supabase == null) return;
    await supabase.auth.signInWithOtp(phone: phone);
  }

  Future<AuthResponse?> verifyPhoneOtp({
    required String phone,
    required String otp,
  }) async {
    final supabase = client;
    if (supabase == null) return null;
    return supabase.auth.verifyOTP(
      type: OtpType.sms,
      phone: phone,
      token: otp,
    );
  }

  /// Sync Supabase JWT into secure storage for NestJS API calls.
  Future<void> syncSessionToTokenStorage() async {
    final session = client?.auth.currentSession;
    if (session == null) return;
    await _tokenStorage.saveTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken ?? '',
    );
  }

  Future<void> signOut() async {
    await client?.auth.signOut();
    await _tokenStorage.clearTokens();
  }

  bool get hasActiveSession => client?.auth.currentSession != null;
}
