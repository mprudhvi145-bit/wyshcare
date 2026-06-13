import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_session.dart';
import 'doctor_profile.dart';
import 'token_storage.dart';
import 'wyshcare_config.dart';

class AuthModule {
  final WyshCareConfig config;
  final TokenStorage tokenStorage;
  final http.Client _client;

  AuthModule({required this.config, required this.tokenStorage})
      : _client = http.Client();

  Future<AuthSession> requestOtp({String? email, String? phoneNumber, String channel = 'SMS'}) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/doctor/auth/otp/request'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        if (email != null) 'email': email,
        if (phoneNumber != null) 'phoneNumber': phoneNumber,
        'channel': channel,
      }),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('OTP request failed: ${response.statusCode}');
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return AuthSession.fromJson(data);
  }

  Future<AuthSession> verifyOtp({String? email, String? phoneNumber, required String otpCode, String deviceName = 'WyshCare Mobile Doctor App'}) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/doctor/auth/otp/verify'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        if (email != null) 'email': email,
        if (phoneNumber != null) 'phoneNumber': phoneNumber,
        'otpCode': otpCode,
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

  Future<void> logout() async {
    await tokenStorage.clearTokens();
  }
}
