/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/core/authentication/auth_notifier.dart
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
 * Flutter/Dart module: auth_notifier
 *
 * Responsibilities:
 * - Implement authentication functionality in Flutter
 *
 * Used By:
 - apps/doctor-mobile/lib/features/specialties/widgets/billing_panel.dart
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/auth/login_screen.dart
 - apps/doctor-mobile/lib/features/encounters/emr_workspace_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/doctor-mobile/lib/features/messages/messages_screen.dart
 - apps/doctor-mobile/lib/core/authentication/auth_notifier.dart
 - apps/doctor-mobile/lib/main.dart
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

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import 'package:wyshcare_patient_sdk/wyshcare_patient_sdk.dart';
import '../network/sdk_provider.dart';
import 'supabase_auth_bridge.dart';

enum AuthStatus { initial, unauthenticated, otpSent, authenticated, error }

class AuthState {
  final AuthStatus status;
  final String? phoneNumber;
  final AuthSession? session;
  final UserProfile? profile;
  final String? errorMessage;
  final bool isBiometricAvailable;
  final bool needsOnboarding;

  const AuthState({
    required this.status,
    this.phoneNumber,
    this.session,
    this.profile,
    this.errorMessage,
    this.isBiometricAvailable = false,
    this.needsOnboarding = false,
  });

  AuthState copyWith({
    AuthStatus? status,
    String? phoneNumber,
    AuthSession? session,
    UserProfile? profile,
    String? errorMessage,
    bool? isBiometricAvailable,
    bool? needsOnboarding,
  }) {
    return AuthState(
      status: status ?? this.status,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      session: session ?? this.session,
      profile: profile ?? this.profile,
      errorMessage: errorMessage,
      isBiometricAvailable: isBiometricAvailable ?? this.isBiometricAvailable,
      needsOnboarding: needsOnboarding ?? this.needsOnboarding,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier({
    required this._sdk,
    required TokenStorage tokenStorage,
    required this._supabaseBridge,
  })  : _tokenStorage = tokenStorage,
        super(const AuthState(status: AuthStatus.initial)) {
    checkCachedSession();
  }

  final WyshCarePatientSDK _sdk;
  final TokenStorage _tokenStorage;
  final SupabaseAuthBridge _supabaseBridge;
  final LocalAuthentication _localAuth = LocalAuthentication();

  Future<void> checkCachedSession() async {
    try {
      final biometrics =
          await _localAuth.canCheckBiometrics && await _localAuth.isDeviceSupported();
      state = state.copyWith(isBiometricAvailable: biometrics);

      if (_supabaseBridge.hasActiveSession) {
        await _supabaseBridge.syncSessionToTokenStorage();
      }

      final accessToken = await _tokenStorage.getAccessToken();
      if (accessToken != null) {
        try {
          final profile = await _sdk.auth.getCurrentUser();
          state = state.copyWith(
            status: AuthStatus.authenticated,
            profile: profile,
            needsOnboarding: profile.fullName.isEmpty,
          );
          return;
        } catch (_) {
          await logout();
        }
      }

      state = state.copyWith(status: AuthStatus.unauthenticated);
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString(),
      );
    }
  }

  Future<bool> authenticateWithBiometrics() async {
    if (!state.isBiometricAvailable) return false;
    final didAuthenticate = await _localAuth.authenticate(
      localizedReason: 'Unlock WyshCare',
      options: const AuthenticationOptions(stickyAuth: true, biometricOnly: true),
    );
    if (didAuthenticate) {
      await checkCachedSession();
      return state.status == AuthStatus.authenticated;
    }
    return false;
  }

  Future<void> sendOtp(String phoneNumber) async {
    try {
      state = state.copyWith(errorMessage: null, phoneNumber: phoneNumber);
      if (SupabaseAuthBridge.isEnabled) {
        await _supabaseBridge.requestPhoneOtp(phoneNumber);
      } else {
        await _sdk.auth.requestOtp(phoneNumber, OtpPurpose.login);
      }
      state = state.copyWith(status: AuthStatus.otpSent);
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> verifyOtp(String otpCode) async {
    try {
      state = state.copyWith(errorMessage: null);
      final phone = state.phoneNumber;
      if (phone == null) return;

      AuthSession session;
      if (SupabaseAuthBridge.isEnabled) {
        await _supabaseBridge.verifyPhoneOtp(phone: phone, otp: otpCode);
        await _supabaseBridge.syncSessionToTokenStorage();
        final storedRefreshToken = await _sdk.tokenStorage.getRefreshToken();
        session = await _sdk.auth.refreshSession(storedRefreshToken ?? '');
      } else {
        session = await _sdk.auth.verifyOtp(
          phone,
          otpCode,
          'WyshCare Patient App',
        );
      }

      UserProfile profile;
      try {
        profile = await _sdk.auth.getCurrentUser();
      } catch (_) {
        profile = UserProfile(
          id: session.user?.id ?? '',
          fullName: session.user?.fullName,
          phoneNumber: phone,
        );
      }

      state = state.copyWith(
        status: AuthStatus.authenticated,
        session: session,
        profile: profile,
        needsOnboarding: profile.fullName.isEmpty,
      );
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
    }
  }

  Future<void> logout() async {
    if (SupabaseAuthBridge.isEnabled) {
      await _supabaseBridge.signOut();
    } else {
      await _sdk.auth.logout();
    }
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final supabaseAuthBridgeProvider = Provider<SupabaseAuthBridge>((ref) {
  return SupabaseAuthBridge(ref.watch(tokenStorageProvider));
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    sdk: ref.watch(patientSdkProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
    supabaseBridge: ref.watch(supabaseAuthBridgeProvider),
  );
});
