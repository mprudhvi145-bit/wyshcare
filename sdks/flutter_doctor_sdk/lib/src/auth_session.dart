import 'doctor_profile.dart';

class AuthSession {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final DoctorProfile? user;

  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    this.user,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresIn: json['expiresIn'] as int,
      user: json['user'] != null
          ? DoctorProfile.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }
}
