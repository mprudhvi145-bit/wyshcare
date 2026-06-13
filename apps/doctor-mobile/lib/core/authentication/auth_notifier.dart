/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/core/authentication/auth_notifier.dart
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
 - apps/doctor-mobile/lib/main.dart
 - apps/doctor-mobile/lib/features/dashboard/main_shell.dart
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

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import 'package:wyshcare_doctor_sdk/wyshcare_doctor_sdk.dart';
import '../network/sdk_provider.dart';

enum AuthStatus { initial, unauthenticated, otpSent, authenticated, error }

class AuthState {
  final AuthStatus status;
  final String? email;
  final String? phoneNumber;
  final AuthSession? session;
  final DoctorProfile? doctorProfile;
  final String? errorMessage;
  final bool isBiometricAvailable;

  const AuthState({
    required this.status,
    this.email,
    this.phoneNumber,
    this.session,
    this.doctorProfile,
    this.errorMessage,
    this.isBiometricAvailable = false,
  });

  AuthState copyWith({
    AuthStatus? status,
    String? email,
    String? phoneNumber,
    AuthSession? session,
    DoctorProfile? doctorProfile,
    String? errorMessage,
    bool? isBiometricAvailable,
  }) {
    return AuthState(
      status: status ?? this.status,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      session: session ?? this.session,
      doctorProfile: doctorProfile ?? this.doctorProfile,
      errorMessage: errorMessage ?? this.errorMessage,
      isBiometricAvailable: isBiometricAvailable ?? this.isBiometricAvailable,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final WyshCareDoctorSDK _sdk;
  final TokenStorage _tokenStorage;
  final LocalAuthentication _localAuth = LocalAuthentication();

  AuthNotifier({
    required this._sdk,
    required TokenStorage tokenStorage,
  })  : _tokenStorage = tokenStorage,
        super(const AuthState(status: AuthStatus.initial)) {
    checkCachedSession();
  }

  /// Initialize and check biometrics & cached tokens
  Future<void> checkCachedSession() async {
    try {
      final isAvailable = await _localAuth.canCheckBiometrics && await _localAuth.isDeviceSupported();
      state = state.copyWith(isBiometricAvailable: isAvailable);

      final accessToken = await _tokenStorage.getAccessToken();
      if (accessToken != null) {
        // If biometric is enabled, we'd normally prompt here. For startup, check token.
        // We'll perform a quick profile list call to verify token freshness.
        try {
          final list = await _sdk.doctors.list();
          // Find if we have a matching profile, or assume first for simulation
          final profile = list.isNotEmpty ? list.first : null;
          
          state = state.copyWith(
            status: AuthStatus.authenticated,
            doctorProfile: profile,
          );
        } catch (e) {
          // Token expired, clear or request refresh
          await logout();
        }
      } else {
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString(),
      );
    }
  }

  /// Authenticate using local biometrics to unlock secure session
  Future<bool> authenticateWithBiometrics() async {
    if (!state.isBiometricAvailable) return false;
    try {
      final didAuthenticate = await _localAuth.authenticate(
        localizedReason: 'Verify your identity to open clinical workspace',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );
      if (didAuthenticate) {
        final accessToken = await _tokenStorage.getAccessToken();
        if (accessToken != null) {
          await checkCachedSession();
          return true;
        }
      }
      return false;
    } on PlatformException catch (e) {
      state = state.copyWith(errorMessage: e.message);
      return false;
    }
  }

  /// Request OTP via Email or SMS
  Future<void> sendOtp({String? email, String? phoneNumber}) async {
    try {
      state = state.copyWith(errorMessage: null);
      final isEmail = email != null && email.isNotEmpty;
      
      await _sdk.auth.requestOtp(
        email: email,
        phoneNumber: phoneNumber,
        channel: isEmail ? 'EMAIL' : 'SMS',
      );

      state = state.copyWith(
        status: AuthStatus.otpSent,
        email: email,
        phoneNumber: phoneNumber,
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString(),
      );
    }
  }

  /// Verify OTP and log in
  Future<void> verifyOtp(String otpCode) async {
    try {
      state = state.copyWith(errorMessage: null);
      final session = await _sdk.auth.verifyOtp(
        email: state.email,
        phoneNumber: state.phoneNumber,
        otpCode: otpCode,
        deviceName: 'WyshCare Mobile Doctor App',
      );

      // Load doctor profile
      DoctorProfile? profile;
      try {
        final list = await _sdk.doctors.list();
        profile = list.isNotEmpty ? list.first : null;
      } catch (_) {
        // If no profile exists, onboard a temporary one (simulated)
        if (session.user != null) {
          profile = await _sdk.doctors.onboard({
            'userId': session.user!.id,
            'name': session.user!.fullName ?? 'Dr. Wysh Care',
            'specializations': ['General Medicine'],
            'registrationNumber': 'REG-${session.user!.id.substring(0, 5)}',
            'experience': 5,
            'consultationFee': 500.0,
          });
        }
      }

      state = state.copyWith(
        status: AuthStatus.authenticated,
        session: session,
        doctorProfile: profile,
      );
    } catch (e) {
      state = state.copyWith(
        errorMessage: e.toString(),
      );
    }
  }

  /// Log out
  Future<void> logout() async {
    await _sdk.auth.logout();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

/// Auth notifier provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final sdk = ref.watch(doctorSdkProvider);
  final tokenStorage = ref.watch(tokenStorageProvider);
  return AuthNotifier(sdk: sdk, tokenStorage: tokenStorage);
});
