import 'dart:convert';
import 'package:http/http.dart' as http;
import 'appointment.dart';
import 'wyshcare_config.dart';

class TelemedicineModule {
  final WyshCareConfig config;
  final http.Client _client;

  TelemedicineModule({required this.config}) : _client = http.Client();

  Future<List<Appointment>> listAppointments() async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/telemedicine/appointments'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to list appointments: ${response.statusCode}');
    }
    final data = jsonDecode(response.body) as List<dynamic>;
    return data.map((e) => Appointment.fromJson(e as Map<String, dynamic>)).toList();
  }
}
