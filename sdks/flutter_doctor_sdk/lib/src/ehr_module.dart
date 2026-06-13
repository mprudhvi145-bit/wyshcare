import 'dart:convert';
import 'package:http/http.dart' as http;
import 'wyshcare_config.dart';

class EhrModule {
  final WyshCareConfig config;
  final http.Client _client;

  EhrModule({required this.config}) : _client = http.Client();

  Future<List<Map<String, dynamic>>> listAllergies(String patientId) async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/ehr/$patientId/allergies'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to list allergies: ${response.statusCode}');
    }
    return (jsonDecode(response.body) as List<dynamic>).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> listConditions(String patientId) async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/ehr/$patientId/conditions'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to list conditions: ${response.statusCode}');
    }
    return (jsonDecode(response.body) as List<dynamic>).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> listAlerts(String patientId) async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/ehr/$patientId/alerts'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to list alerts: ${response.statusCode}');
    }
    return (jsonDecode(response.body) as List<dynamic>).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> createNote(String patientId, Map<String, dynamic> note) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/ehr/$patientId/notes'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(note),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to create note: ${response.statusCode}');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addDiagnosis(String patientId, Map<String, dynamic> diagnosis) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/ehr/$patientId/diagnoses'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(diagnosis),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to add diagnosis: ${response.statusCode}');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createEncounter(Map<String, dynamic> encounter) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/ehr/encounters'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(encounter),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to create encounter: ${response.statusCode}');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<void> closeEncounter(String encounterId) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/ehr/encounters/$encounterId/close'),
      headers: {'Content-Type': 'application/json'},
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to close encounter: ${response.statusCode}');
    }
  }

  Future<void> recordVitals(Map<String, dynamic> vitals) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}/api/v1/ehr/vitals'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(vitals),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to record vitals: ${response.statusCode}');
    }
  }
}
