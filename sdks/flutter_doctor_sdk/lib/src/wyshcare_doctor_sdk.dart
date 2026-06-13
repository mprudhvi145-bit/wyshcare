import 'token_storage.dart';
import 'wyshcare_config.dart';
import 'auth_module.dart';
import 'doctors_module.dart';
import 'ai_module.dart';
import 'ehr_module.dart';
import 'telemedicine_module.dart';
import 'prescriptions_module.dart';
import 'client_module.dart';
import 'clinic_module.dart';

class WyshCareDoctorSDK {
  final WyshCareConfig config;
  final TokenStorage tokenStorage;
  late final AuthModule auth;
  late final DoctorsModule doctors;
  late final AiModule ai;
  late final EhrModule ehr;
  late final TelemedicineModule telemedicine;
  late final PrescriptionsModule prescriptions;
  late final ClientModule client;
  late final ClinicModule clinic;

  WyshCareDoctorSDK({
    required this.config,
    required this.tokenStorage,
  }) {
    auth = AuthModule(config: config, tokenStorage: tokenStorage);
    doctors = DoctorsModule(config: config);
    ai = AiModule(config: config);
    ehr = EhrModule(config: config);
    telemedicine = TelemedicineModule(config: config);
    prescriptions = PrescriptionsModule(config: config);
    client = ClientModule(config: config);
    clinic = ClinicModule(config: config);
  }

  void dispose() {}
}
