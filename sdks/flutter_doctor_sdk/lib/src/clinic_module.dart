import 'dart:convert';
import 'package:http/http.dart' as http;
import 'wyshcare_config.dart';

class ClinicModule {
  final WyshCareConfig config;
  final http.Client _client;

  ClinicModule({required this.config}) : _client = http.Client();

  Future<List<Map<String, dynamic>>> listBranches() async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/clinic/branches'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to list branches: ${response.statusCode}');
    }
    return (jsonDecode(response.body) as List<dynamic>).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> getQueue(String branchId) async {
    final response = await _client.get(
      Uri.parse('${config.baseUrl}/api/v1/clinic/branches/$branchId/queue'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to get queue: ${response.statusCode}');
    }
    return (jsonDecode(response.body) as List<dynamic>).cast<Map<String, dynamic>>();
  }
}
