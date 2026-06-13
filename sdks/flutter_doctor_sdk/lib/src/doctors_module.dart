import 'dart:convert';
import 'package:http/http.dart' as http;
import 'doctor_profile.dart';
import 'wyshcare_config.dart';

class DoctorsModule {
  final WyshCareConfig config;
  final http.Client _client;

  DoctorsModule({required this.config}) : _client = http.Client();

  Future<List<DoctorProfile>> list() async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/doctors'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to list doctors: ${response.statusCode}');
    }
    return (jsonDecode(response.body) as List<dynamic>)
        .map((e) => DoctorProfile.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<DoctorProfile> onboard(Map<String, dynamic> profile) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/doctors'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(profile),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Doctor onboard failed: ${response.statusCode}');
    }
    return DoctorProfile.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }
}
