class UserProfile {
  final String id;
  final String fullName;
  final String phoneNumber;
  final String? email;
  final String? wyshId;
  final List<String> roles;

  const UserProfile({
    required this.id,
    required this.fullName,
    required this.phoneNumber,
    this.email,
    this.wyshId,
    this.roles = const [],
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      phoneNumber: json['phoneNumber'] as String,
      email: json['email'] as String?,
      wyshId: json['wyshId'] as String?,
      roles: (json['roles'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'phoneNumber': phoneNumber,
        'email': email,
        'wyshId': wyshId,
        'roles': roles,
      };
}
