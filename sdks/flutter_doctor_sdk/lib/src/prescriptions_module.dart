import 'dart:convert';
import 'package:http/http.dart' as http;
import 'wyshcare_config.dart';

class PrescriptionsModule {
  final WyshCareConfig config;
  final http.Client _client;

  PrescriptionsModule({required this.config}) : _client = http.Client();

  Future<Map<String, dynamic>> create(Map<String, dynamic> prescription) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/prescriptions'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(prescription),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to create prescription: ${response.statusCode}');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> searchDrugs(String query) async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/prescriptions/search?q=$query'),
    );
    if (response.statusCode != 200) {
      throw Exception('Drug search failed: ${response.statusCode}');
    }
    return (jsonDecode(response.body) as List<dynamic>).cast<Map<String, dynamic>>();
  }
}
