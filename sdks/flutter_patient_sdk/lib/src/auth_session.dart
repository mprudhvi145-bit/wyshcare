class AuthSession {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final UserProfile? user;

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
          ? UserProfile.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'accessToken': accessToken,
        'refreshToken': refreshToken,
        'expiresIn': expiresIn,
        'user': user?.toJson(),
      };
}
