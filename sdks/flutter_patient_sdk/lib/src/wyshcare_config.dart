class WyshCareConfig {
  final String baseUrl;
  final bool enableLogging;
  final Duration timeout;

  const WyshCareConfig({
    required this.baseUrl,
    this.enableLogging = false,
    this.timeout = const Duration(seconds: 30),
  });
}
