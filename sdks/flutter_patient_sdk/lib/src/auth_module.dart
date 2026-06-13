import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_session.dart';
import 'otp_purpose.dart';
import 'token_storage.dart';
import 'user_profile.dart';
import 'wyshcare_config.dart';

class AuthModule {
  final WyshCareConfig config;
  final TokenStorage tokenStorage;
  final http.Client _client;

  AuthModule({required this.config, required this.tokenStorage})
      : _client = http.Client();

  Future<AuthSession> requestOtp(String phoneNumber, OtpPurpose purpose) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/auth/otp/request'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phoneNumber': phoneNumber, 'purpose': purpose.name}),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('OTP request failed: ${response.statusCode}');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return AuthSession.fromJson(data);
  }

  Future<AuthSession> verifyOtp(String phoneNumber, String code, String deviceName) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/auth/otp/verify'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'phoneNumber': phoneNumber,
        'otpCode': code,
        'deviceName': deviceName,
      }),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('OTP verification failed: ${response.statusCode}');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final session = AuthSession.fromJson(data);
    await tokenStorage.saveTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );
    return session;
  }

  Future<AuthSession> refreshSession(String refreshToken) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/auth/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': refreshToken}),
    );

    if (response.statusCode != 200) {
      throw Exception('Session refresh failed: ${response.statusCode}');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final session = AuthSession.fromJson(data);
    await tokenStorage.saveTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );
    return session;
  }

  Future<UserProfile> getCurrentUser() async {
    final token = await tokenStorage.getAccessToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/auth/me'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to fetch user: ${response.statusCode}');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return UserProfile.fromJson(data);
  }

  Future<void> logout() async {
    await tokenStorage.clearTokens();
  }
}
