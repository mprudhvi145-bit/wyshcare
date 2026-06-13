import 'dart:convert';
import 'package:http/http.dart' as http;
import 'wyshcare_config.dart';

class ClientModule {
  final WyshCareConfig config;
  final http.Client _client;

  ClientModule({required this.config}) : _client = http.Client();

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final response = await _client.post(
      Uri.parse('${config.baseUrl}$path'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('POST $path failed: ${response.statusCode}');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}
