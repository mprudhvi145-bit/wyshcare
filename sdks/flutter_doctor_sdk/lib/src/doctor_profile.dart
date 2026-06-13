class DoctorProfile {
  final String id;
  final String fullName;
  final String? phoneNumber;
  final String? email;
  final String? wyshId;
  final List<String> roles;
  final String? specialization;
  final String? registrationNumber;
  final int experience;
  final int consultationFee;
  final List<String> specializations;

  const DoctorProfile({
    required this.id,
    required this.fullName,
    this.phoneNumber,
    this.email,
    this.wyshId,
    this.roles = const [],
    this.specialization,
    this.registrationNumber,
    this.experience = 8,
    this.consultationFee = 500,
    this.specializations = const [],
  });

  String get name => fullName;

  factory DoctorProfile.fromJson(Map<String, dynamic> json) {
    return DoctorProfile(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      phoneNumber: json['phoneNumber'] as String?,
      email: json['email'] as String?,
      wyshId: json['wyshId'] as String?,
      roles: (json['roles'] as List<dynamic>?)?.cast<String>() ?? [],
      specialization: json['specialization'] as String?,
      registrationNumber: json['registrationNumber'] as String?,
      experience: json['experience'] as int? ?? 8,
      consultationFee: json['consultationFee'] as int? ?? 500,
      specializations: (json['specializations'] as List<dynamic>?)
              ?.cast<String>() ??
          (json['specialization'] != null ? [json['specialization'] as String] : []),
    );
  }
}
