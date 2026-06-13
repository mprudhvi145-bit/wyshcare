import 'auth_session.dart';
import 'otp_purpose.dart';
import 'token_storage.dart';
import 'user_profile.dart';
import 'wyshcare_config.dart';
import 'auth_module.dart';

class WyshCarePatientSDK {
  final WyshCareConfig config;
  final TokenStorage tokenStorage;
  late final AuthModule auth;

  WyshCarePatientSDK({
    required this.config,
    required this.tokenStorage,
  }) {
    auth = AuthModule(config: config, tokenStorage: tokenStorage);
  }

  void dispose() {
    // Cleanup resources
  }
}
