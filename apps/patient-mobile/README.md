# WyshCare Patient Mobile

Flutter patient app for WyshCare — 42 screens aligned with `docs/PRODUCT_SPECIFICATION_P1.md`.

## Stack

- **Flutter** + Riverpod + go_router
- **SDK**: `sdks/flutter_patient_sdk` → NestJS REST APIs
- **Auth**: NestJS OTP (default) + optional Supabase phone OTP via `supabase_flutter`
- **Storage**: flutter_secure_storage, Hive

## Run locally

```bash
cd apps/patient-mobile
flutter pub get
flutter run
```

### Environment (dart-define)

```bash
flutter run \
  --dart-define=API_BASE_URL=http://localhost:30013/api/v1 \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key
```

Without Supabase vars, auth uses NestJS OTP only.

## Build

```bash
# Android APK + AAB
../../scripts/build_patient_android.sh

# iOS (requires Xcode)
../../scripts/build_patient_ios.sh
```

**Prerequisites:** JDK 17+ for Android, Xcode + CocoaPods for iOS.

## Screen inventory (42)

| Area | Screens |
|------|---------|
| Onboarding | Splash, Login, Verify OTP, Profile Setup, ABHA Link |
| Home shell | Home, Timeline, Care Hub, Pharmacy, Settings |
| Records | List, Detail, Upload |
| Prescriptions | List, Detail |
| Appointments | List, Book, Detail, Telemedicine Room |
| Discovery | Search, Doctor Profile |
| Diagnostics | List, Book, Order Detail |
| Pharmacy | Home, Search, Partner, Cart, Checkout, Orders, Order Detail |
| AI Twin | Dashboard, Ask, Risks, Trends |
| Family | List, Detail, Add |
| Insurance | Policies, Claim Detail |
| Settings | Main, Security, Notifications, Emergency Profile |
