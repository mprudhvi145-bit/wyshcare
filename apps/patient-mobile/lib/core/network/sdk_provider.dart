/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/patient-mobile/lib/core/network/sdk_provider.dart
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
 * Flutter/Dart module: sdk_provider
 *
 * Responsibilities:
 * - Implement patient functionality in Flutter
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

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:wyshcare_patient_sdk/wyshcare_patient_sdk.dart';
import '../config/app_config.dart';

class SecureTokenStorage implements TokenStorage {
  final FlutterSecureStorage _storage;

  static const _accessTokenKey = 'wyshcare_patient_access_token';
  static const _refreshTokenKey = 'wyshcare_patient_refresh_token';

  SecureTokenStorage([FlutterSecureStorage? storage])
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  @override
  Future<String?> getAccessToken() async {
    try {
      return await _storage.read(key: _accessTokenKey);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<String?> getRefreshToken() async {
    try {
      return await _storage.read(key: _refreshTokenKey);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  @override
  Future<void> clearTokens() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }
}

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return SecureTokenStorage();
});

final wyshCareConfigProvider = Provider<WyshCareConfig>((ref) {
  return WyshCareConfig(
    baseUrl: AppConfig.apiBaseUrl,
    enableLogging: true,
  );
});

final patientSdkProvider = Provider<WyshCarePatientSDK>((ref) {
  final config = ref.watch(wyshCareConfigProvider);
  final tokenStorage = ref.watch(tokenStorageProvider);

  final sdk = WyshCarePatientSDK(
    config: config,
    tokenStorage: tokenStorage,
  );

  ref.onDispose(sdk.dispose);
  return sdk;
});
