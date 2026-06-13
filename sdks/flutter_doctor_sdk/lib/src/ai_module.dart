import 'dart:convert';
import 'package:http/http.dart' as http;
import 'wyshcare_config.dart';

class AiModule {
  final WyshCareConfig config;
  final http.Client _client;

  AiModule({required this.config}) : _client = http.Client();

  Future<Map<String, dynamic>> getLatestRisks(String patientId) async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/ai-risk/$patientId'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to get risks: ${response.statusCode}');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getPreventiveRecommendations(String patientId) async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/ai-preventive/$patientId'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to get recommendations: ${response.statusCode}');
    }
    return (jsonDecode(response.body) as List<dynamic>).cast<Map<String, dynamic>>();
  }
}
