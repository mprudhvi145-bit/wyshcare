class Appointment {
  final String id;
  final DateTime scheduledAt;
  final String status;
  final String reasonForVisit;
  final String? patientName;
  final String? patientId;
  final String? notes;

  const Appointment({
    required this.id,
    required this.scheduledAt,
    required this.status,
    required this.reasonForVisit,
    this.patientName,
    this.patientId,
    this.notes,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'] as String,
      scheduledAt: DateTime.parse(json['scheduledAt'] as String),
      status: json['status'] as String,
      reasonForVisit: json['reasonForVisit'] as String,
      patientName: json['patientName'] as String?,
      patientId: json['patientId'] as String?,
      notes: json['notes'] as String?,
    );
  }
}
