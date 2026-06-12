# WyshCare Doctor Mobile — Multi-Specialty Clinical OS

Flutter doctor app with **5 specialty workspaces**, **E2E encounter workflows**, and dynamic UI driven by `SpecialtyRegistry`.

## Specialties

| Code | Dashboard | Examination Tools |
|------|-----------|-------------------|
| `general-medicine` | SOAP, vitals, chronic care | SOAP, Vitals, Diagnosis, Rx |
| `dental` | FDI chart, radiographs, treatment plans | Tooth Chart, Radiographs, Treatment, SOAP, Billing |
| `ent` | Audiometry, organ exam | Organ Map, Audiometry, Findings, SOAP |
| `dermatology` | Body map lesions | Body Map, Lesions, Photos, SOAP, Rx |
| `ophthalmology` | Refraction, IOP, fundus | Refraction, IOP, Fundus, Findings, SOAP |

## E2E Encounter Workflow

```
Intake → Vitals → Examination → Diagnosis → Treatment → Rx → Billing → Follow-up
```

1. **Queue** — tap patient → auto-detect specialty from complaint
2. **EMR Workspace** — workflow stepper + patient context bar + specialty tabs
3. **Complete** — close encounter → sync to NestJS via `wyshcare_doctor_sdk`

## Architecture

```
lib/core/specialty/specialty_registry.dart   # Specialty configs (metrics, tabs, colors)
lib/core/workflow/workflow_providers.dart    # Encounter workflow state machine
lib/features/dashboard/specialty_dashboard.dart
lib/features/encounters/emr_workspace_screen.dart
lib/features/specialties/specialty_workspace_shell.dart
```

## Run

```bash
cd apps/doctor-mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:30013/api/v1
```

## Routes

| Route | Screen |
|-------|--------|
| `/` | Main shell (dashboard, queue, telehealth, billing) |
| `/encounter` | Full EMR workspace with workflow |
| `/login` | OTP authentication |
| `/telemedicine/:id` | Live video consultation |
