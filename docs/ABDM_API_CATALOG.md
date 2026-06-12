# ABDM API Catalog

> Generated: June 4, 2026
> Source: ABDM M1, M2, M3, PHR, HPR, HFR, UHI, NHCX, Scan & Share documentation

---

## 1. ABHA (Milestone 1) APIs

### 1.1 Authentication & Init

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 1.1 | Init Auth | POST | `/v3/enrollment/enrol/auth/init` | API Key | Start enrollment/login auth (scope: aadhaar-otp/biometric-auth/face-auth/dl-otp) |
| 1.2 | Verify Auth | POST | `/v3/enrollment/enrol/auth/verify` | API Key | Verify OTP/biometric → returns txnId |
| 1.3 | Init Login | POST | `/v3/profile/login/init/faceAuth` | API Key | Initiate face auth login |
| 1.4 | Capture PID | POST | `/v3/enrollment/enrol/capturePID` | Bearer Token | Poll face/biometric capture status |
| 1.5 | Get Public Certificate | GET | `/v3/profile/public/certificate` | API Key | RSA public key for encryption |

### 1.2 Enrollment / ABHA Creation

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 1.6 | Encrypt Aadhaar | POST | `/v3/enrollment/enrol/aadhaar/encrypt` | Bearer Token | RSA-encrypt Aadhaar number |
| 1.7 | Enroll by Aadhaar | POST | `/v3/enrollment/enrol/byAadhaar` | Bearer Token | Create ABHA via Aadhaar |
| 1.8 | Enroll by Driving License | POST | `/v3/enrollment/enrol/byDrivingLicense` | Bearer Token | Create ABHA via DL |
| 1.9 | Enroll by Demo Auth | POST | `/v3/enrollment/enrol/createHealthIdByAdhaarDemo` | Bearer Token | Create ABHA via offline demo |
| 1.10 | Verify Mobile | POST | `/v3/enrollment/enrol/mobile/verify` | Bearer Token | Verify mobile OTP |
| 1.11 | Verify Email | POST | `/v3/enrollment/enrol/email/verify` | Bearer Token | Verify email OTP |
| 1.12 | Resend Mobile OTP | POST | `/v3/enrollment/enrol/mobile/resend-otp` | Bearer Token | Resend mobile OTP |
| 1.13 | Get Suggested Usernames | POST | `/v3/enrollment/enrol/suggested-usernames` | Bearer Token | Get ABHA address suggestions |
| 1.14 | Create Account (no password) | POST | `/v3/enrollment/enrol/create-account-without-password` | Bearer Token | Create ABHA address |
| 1.15 | Create Account (with password) | POST | `/v3/enrollment/enrol/create-account-with-password` | Bearer Token | Create ABHA address with password |

### 1.3 ABHA Login / Verification

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 1.16 | Login - Aadhaar OTP | POST | `/v3/profile/login/verify/aadhaarOtp` | API Key | Verify via Aadhaar OTP |
| 1.17 | Login - Aadhaar Number | POST | `/v3/profile/login/verify/aadhaar` | API Key | Verify via Aadhaar number |
| 1.18 | Login - ABHA OTP | POST | `/v3/profile/login/verify/healthId` | API Key | Verify via ABHA OTP |
| 1.19 | Login - Mobile OTP | POST | `/v3/profile/login/verify/phone` | API Key | Verify via mobile OTP |
| 1.20 | Login - Password | POST | `/v3/profile/login/verify/password` | API Key | Verify via password |
| 1.21 | Login - Face Auth | POST | `/v3/profile/login/verify/faceAuth` | Bearer Token | Verify via face auth |
| 1.22 | Login - Biometric | POST | `/v3/profile/login/verify/biometric` | API Key | Verify via fingerprint/iris |

### 1.4 Find ABHA

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 1.23 | Search by Mobile | POST | `/v3/profile/account/abha/search` | API Key | Find ABHA by encrypted mobile |
| 1.24 | Search by Aadhaar | POST | `/v3/profile/account/abha/searchByAadhaar` | API Key | Find ABHA by encrypted Aadhaar |

### 1.5 Profile Management

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 1.25 | Get Profile | GET | `/v3/profile/account` | Bearer Token | Get ABHA profile |
| 1.26 | Update Profile | PUT | `/v3/profile/account` | Bearer Token | Update ABHA profile |
| 1.27 | Update Mobile | POST | `/v3/profile/account/mobile/update` | Bearer Token | Change mobile number |
| 1.28 | Update Email | POST | `/v3/profile/account/email/update` | Bearer Token | Change email |
| 1.29 | Change Password | POST | `/v3/profile/account/password/change` | Bearer Token | Change password |
| 1.30 | Get QR Code | GET | `/v3/profile/account/qrCode` | Bearer Token | Get ABHA QR code |
| 1.31 | Get ABHA Card | GET | `/v3/profile/account/abhaCard` | Bearer Token | Get printable ABHA card |
| 1.32 | Deactivate ABHA | POST | `/v3/profile/account/deactivate` | Bearer Token | Deactivate ABHA |
| 1.33 | Delete ABHA | POST | `/v3/profile/account/delete` | Bearer Token | Delete ABHA permanently |
| 1.34 | Reactivate ABHA | POST | `/v3/profile/account/reactivate` | Bearer Token | Reactivate deactivated ABHA |
| 1.35 | Re-KYC | POST | `/v3/profile/account/rekyc` | Bearer Token | Re-verify KYC |

---

## 2. PHR App APIs

### 2.1 Base URLs
- **Sandbox**: `https://abhasbx.abdm.gov.in/abha/api/v3/phr/app/`
- **Production**: `https://apis.abdm.gov.in/phr/api/phr/app/v3/`

### 2.2 Registration

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 2.1 | Request Registration OTP | POST | `/registration/request/otp` | API Key | Send OTP for registration |
| 2.2 | Verify Registration OTP | POST | `/registration/verify/otp` | API Key | Create PHR account |

### 2.3 Authentication (10+ methods)

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 2.3 | Login - Mobile OTP Request | POST | `/auth/phone/login/request/otp` | API Key | Request mobile OTP |
| 2.4 | Login - Mobile OTP Verify | POST | `/auth/phone/login/verify/otp` | API Key | Verify mobile OTP |
| 2.5 | Login - Email OTP Request | POST | `/auth/email/login/request/otp` | API Key | Request email OTP |
| 2.6 | Login - ABHA OTP Request | POST | `/auth/abha/login/request/otp` | API Key | ABHA → Aadhaar OTP |
| 2.7 | Login - ABHA Mobile OTP | POST | `/auth/abha/login/request/aadhaarOtp` | API Key | ABHA → mobile OTP |
| 2.8 | Login - ABHA Password | POST | `/auth/abha-address/login` | API Key | Password login |
| 2.9 | Login - ABHA Mobile OTP | POST | `/auth/abha-address/login/request/otp` | API Key | ABHA address mobile OTP |
| 2.10 | Login - Aadhaar OTP | POST | `/auth/aadhaar/login/request/otp` | API Key | Aadhaar OTP login |
| 2.11 | Login - Face Auth | POST | `/auth/face/login/request` | API Key | Face auth login |
| 2.12 | Refresh Token | POST | `/auth/refresh/token` | Bearer Token | Refresh auth token |

### 2.4 PHR Profile Management

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 2.13 | Get Profile | GET | `/profile/account` | Bearer Token | Get PHR profile |
| 2.14 | Edit Profile | PUT | `/profile/account` | Bearer Token | Update PHR profile |
| 2.15 | Update Mobile | POST | `/profile/account/mobile/update` | Bearer Token | Change mobile |
| 2.16 | Update Email | POST | `/profile/account/email/update` | Bearer Token | Change email |
| 2.17 | Get QR Code | GET | `/profile/account/qrCode` | Bearer Token | Get PHR QR code |
| 2.18 | Get PHR Card | GET | `/profile/account/phrCard` | Bearer Token | Get PHR card |
| 2.19 | Logout | POST | `/auth/logout` | Bearer Token | Logout |
| 2.20 | Link ABHA Address | POST | `/profile/account/link/abhaAddress` | Bearer Token | Link ABHA to PHR |
| 2.21 | Switch Profile | POST | `/profile/account/switch/profile` | Bearer Token | Switch between profiles |
| 2.22 | Get PHR Certificate | GET | `/profile/account/phrCertificate` | Bearer Token | Get PHR certificate |

---

## 3. Gateway APIs (Milestone 2 — Common Infrastructure)

### 3.1 Authentication

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 3.1 | Get Auth Token | POST | `/auth/realms/abdm/protocol/openid-connect/token` | Client Credentials | OAuth2 client credentials |
| 3.2 | OpenID Config | GET | `/auth/realms/abdm/.well-known/openid-configuration` | None | OpenID discovery |
| 3.3 | Keycloak Certificates | GET | `/auth/realms/abdm/protocol/openid-connect/certs` | None | JWK certificates |

### 3.2 Bridge & Facility Registration

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 3.4 | Update Bridge URL | POST | `/v3/bridge/update` | Bearer Token | Register/update bridge callback URL |
| 3.5 | Register Facility | POST | `/v3/facility/register` | Bearer Token | Register facility with ABDM |
| 3.6 | Software Linkage | POST | `/v3/facility/software-linkage` | Bearer Token | Link software to facility |
| 3.7 | Find Bridge by Service ID | GET | `/v3/bridge/findByServiceId` | Bearer Token | Get bridge details by service ID |
| 3.8 | Find Services by Bridge ID | GET | `/v3/bridge/findServicesByBridgeId` | Bearer Token | List services by bridge |

---

## 4. HIP Linking APIs (Milestone 2)

### 4.1 HIP-Initiated Linking

| # | API | Method | Path | Auth | Direction | Description |
|---|---|---|---|---|---|---|
| 4.1 | Generate Link Token | POST | `/v3/token/generate-token` | Bearer Token | HIP → CM | Generate OTP for patient linking |
| 4.2 | Link Care Context | POST | `/v3/link/carecontext` | Bearer Token | HIP → CM | Link care contexts to patient |
| 4.3 | Notify Care Context Update | POST | `/v3/link/context/notify` | Bearer Token | HIP → CM | Notify PHR of new care contexts |
| 4.4 | SMS Notify | POST | `/v3/link/patient/links/sms/notify2` | Bearer Token | CM → HIP | Send SMS to patient about linking |

### 4.2 User-Initiated Linking

| # | API | Method | Path | Auth | Direction | Description |
|---|---|---|---|---|---|---|
| 4.5 | Patient Discovery | POST | `/v3/patient/care-context/discover` | Bearer Token | HIU → CM | Discover patient by ABHA address |
| 4.6 | Init Link | POST | `/v3/link/care-context/init` | Bearer Token | HIU → CM | Initiate care context linking |
| 4.7 | Confirm Link | POST | `/v3/link/care-context/confirm` | Bearer Token | HIU → CM | Confirm linking |

### 4.3 HIP Callbacks (to be implemented by HIP)

| # | API | Method | Path | Auth | Direction | Description |
|---|---|---|---|---|---|---|
| 4.8 | Patient Discovery Callback | POST | `/v3/patient/care-context/discover` | Bearer Token | CM → HIP | HIE-CM asks HIP to discover patient |
| 4.9 | Link Context Callback | POST | `/v3/link/carecontext` | Bearer Token | CM → HIP | Patient selects care contexts to link |

---

## 5. Data Flow APIs (Milestone 2 & 3)

### 5.1 Health Information Request/Transfer

| # | API | Method | Path | Auth | Direction | Description |
|---|---|---|---|---|---|---|
| 5.1 | Request Health Information | POST | `/v3/health-information/request` | Bearer Token | HIU → CM | Request data against consent artefact |
| 5.2 | HIP Data Request Callback | POST | `/v3/health-information/hip/request` | Bearer Token | CM → HIP | Notify HIP of data request |
| 5.3 | Notify Health Information | POST | `/v3/health-information/notify` | Bearer Token | HIP → CM | Push encrypted FHIR data |
| 5.4 | Transfer Health Information | POST | `/v3/health-information/transfer` | Bearer Token | CM → HIU | Deliver decrypted data to HIU |

### 5.2 Encryption Keys

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 5.5 | Get ECDH Public Key | GET | `/v3/keys/upload` | Bearer Token | Upload ECDH public key |
| 5.6 | Get HIU Public Key | GET | `/v3/keys/{hiuId}` | Bearer Token | Get HIU's ECDH public key |

---

## 6. Consent Management APIs (Milestone 3)

### 6.1 Consent Request

| # | API | Method | Path | Auth | Direction | Description |
|---|---|---|---|---|---|---|
| 6.1 | Init Consent Request | POST | `/v3/consent-requests/init` | Bearer Token | HIU → CM | Request patient consent |
| 6.2 | Get Consent Request Status | POST | `/v3/consent-requests/status` | Bearer Token | HIU → CM | Check status of consent request |
| 6.3 | Fetch Consent Artefact | POST | `/v3/consents/fetch` | Bearer Token | HIU → CM | Fetch granted consent artefact |
| 6.4 | HIP Consent Notify Callback | POST | `/v3/consent-requests/hip/notify` | Bearer Token | CM → HIP | Notify HIP of consent request |

### 6.2 Consent Lifecycle

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 6.5 | Revoke Consent | POST | `/v3/consents/revoke` | Bearer Token | Patient revokes consent |
| 6.6 | Get Consent Artefact by ID | GET | `/v3/consents/{id}` | Bearer Token | Fetch specific artefact |
| 6.7 | List Consents | GET | `/v3/consents` | Bearer Token | List patient's consents |

### 6.3 Subscription

| # | API | Method | Path | Auth | Description |
|---|---|---|---|---|---|
| 6.8 | Init Subscription Request | POST | `/v3/subscription-requests/v3/init` | Bearer Token | Init subscription for LINK/DATA |
| 6.9 | Approve Subscription | POST | `/v3/subscription-requests/v3/approve` | Bearer Token | Approve subscription |
| 6.10 | Deny Subscription | POST | `/v3/subscription-requests/v3/deny` | Bearer Token | Deny subscription |
| 6.11 | Edit Subscription | POST | `/v3/subscription-requests/v3/edit` | Bearer Token | Edit subscription config |
| 6.12 | Subscription Notify | POST | `/v3/subscription-requests/v3/notify` | Bearer Token | CM → HIP/HIU, notify about subscription event |

---

## 7. Scan & Share APIs (Milestone 2)

| # | API | Method | Path | Auth | Direction | Description |
|---|---|---|---|---|---|---|
| 7.1 | Share | POST | `/v3/share` | Bearer Token | PHR → CM | Share profile or records with facility |
| 7.2 | On Share Callback | POST | `/v3/on-share` | Bearer Token | CM → HIP | Deliver shared data to facility |
| 7.3 | On Share Response | POST | `/v3/on-share` | Bearer Token | HIP → CM | Acknowledge receipt of shared data |

---

## 8. Scan & Pay APIs

| # | API | Method | Path | Auth | Direction | Description |
|---|---|---|---|---|---|---|
| 8.1 | Share Open Order | POST | `/v3/patient/share/open-order` | Bearer Token | PHR → CM | Open bill/payment request |
| 8.2 | On Share Open Order Callback | POST | `/v3/patient/share/open-order` | Bearer Token | CM → HIP | Deliver open order to facility |
| 8.3 | On Share Open Order | POST | `/v3/patient/on-share/open-order` | Bearer Token | HIP → CM | Return bill details + outstanding |
| 8.4 | Patient Share Notify | POST | `/v3/patient/share/notify` | Bearer Token | PHR → CM → HIP | Notify of patient selection |
| 8.5 | Get All Details | GET | `/v3/patient/share/details` | Bearer Token | PHR → CM | Get payment details |
| 8.6 | Update Version | PUT | `/v3/patient/share/version` | Bearer Token | HIP → CM | Update scan & pay version |
| 8.7 | Get Provider Details | GET | `/v3/patient/share/provider-details` | Bearer Token | PHR → CM | Get provider info |
| 8.8 | Share Order Status | POST | `/v3/patient/share/order-status` | Bearer Token | PHR → CM | Check payment status |

---

## 9. Running Token Status APIs

| # | API | Method | Path | Auth | Direction | Description |
|---|---|---|---|---|---|---|
| 9.1 | Request Token Status | POST | `/v3/running-token/status` | Bearer Token | PHR → CM | Request current token number |
| 9.2 | Token Status Callback | POST | `/v3/hip/patient/running-token/status` | Bearer Token | CM → HIP | Deliver token request to facility |
| 9.3 | On Token Status | POST | `/v3/running-token/on-status` | Bearer Token | HIP → CM | Return token + wait time |

---

## 10. HPR — Healthcare Professional Registry APIs

### 10.1 Registration

| # | API | Method | Path | Description |
|---|---|---|---|---|
| 10.1 | Generate Aadhaar OTP | POST | `/hpr/v3/aadhaar/otp/generate` | Send OTP to Aadhaar-linked mobile |
| 10.2 | Verify Aadhaar OTP | POST | `/hpr/v3/aadhaar/otp/verify` | Verify OTP, get enrollment token |
| 10.3 | Verify Mobile | POST | `/hpr/v3/mobile/verify` | Verify mobile number |
| 10.4 | Get Suggested Username | POST | `/hpr/v3/username/suggest` | Generate HPRID suggestions |
| 10.5 | Create HPRID | POST | `/hpr/v3/hprid/create` | Create Healthcare Professional ID |
| 10.6 | Search Facility | POST | `/hpr/v3/facility/search` | Find facility for registration |
| 10.7 | Register Professional | POST | `/hpr/v3/professional/register` | Register professional at facility |
| 10.8 | Upload Documents | POST | `/hpr/v3/document/upload` | Upload qualification docs |

### 10.2 Profile Management

| # | API | Method | Path | Description |
|---|---|---|---|---|
| 10.9 | Get Professional Details | GET | `/hpr/v3/professional/details` | Fetch full professional profile |
| 10.10 | Update Professional | PUT | `/hpr/v3/professional/update` | Update professional details |
| 10.11 | Update Documents | PUT | `/hpr/v3/document/update` | Upload/update documents |

### 10.3 Authentication

| # | API | Method | Path | Description |
|---|---|---|---|---|
| 10.12 | Login | POST | `/hpr/v3/auth/login` | Professional login |
| 10.13 | Logout | POST | `/hpr/v3/auth/logout` | Logout |
| 10.14 | Get ID Card | GET | `/hpr/v3/id-card` | Get HPRID card |
| 10.15 | Change Password | POST | `/hpr/v3/auth/password/change` | Change password |
| 10.16 | Forgot HPRID | POST | `/hpr/v3/auth/forgot/hprid` | Recover HPRID |
| 10.17 | Search HPRID | POST | `/hpr/v3/auth/search/hprid` | Search for HPRID |

### 10.4 Master Data

| # | API | Method | Path | Description |
|---|---|---|---|---|
| 10.18 | System of Medicine | GET | `/hpr/v3/master/systemOfMedicine` | List systems of medicine |
| 10.19 | Medical Councils | GET | `/hpr/v3/master/medicalCouncils` | List medical councils |
| 10.20 | Languages | GET | `/hpr/v3/master/languages` | List languages |
| 10.21 | Universities | GET | `/hpr/v3/master/universities` | List universities |
| 10.22 | Courses | GET | `/hpr/v3/master/courses` | List courses |
| 10.23 | Colleges | GET | `/hpr/v3/master/colleges` | List colleges |
| 10.24 | Countries | GET | `/hpr/v3/master/countries` | List countries |
| 10.25 | States | GET | `/hpr/v3/master/states` | List states (LGD codes) |
| 10.26 | Districts | GET | `/hpr/v3/master/districts/{stateId}` | List districts |
| 10.27 | HPRID Categories | GET | `/hpr/v3/master/hpridCategories` | List professional categories |

---

## 11. HFR — Health Facility Registry APIs

| # | API | Method | Path | Description |
|---|---|---|---|---|
| 11.1 | Search Facility | POST | `/hfr/v4/facility/search` | Search facilities by criteria |
| 11.2 | Create Facility | POST | `/hfr/v4/facility/create` | Create new facility |
| 11.3 | Get Facility Details | GET | `/hfr/v4/facility/{id}` | Get facility by ID |
| 11.4 | Register Facility | POST | `/hfr/v4/facility/register` | Register facility with ABDM |
| 11.5 | Software Linkage | POST | `/hfr/v4/facility/software-linkage` | Link software to facility |
| 11.6 | Ownership Codes | GET | `/hfr/v4/master/ownership-codes` | List ownership types |
| 11.7 | States | GET | `/hfr/v4/master/states` | List states |
| 11.8 | Districts by State | GET | `/hfr/v4/master/districts/{stateId}` | List districts |

---

## 12. UHI Protocol APIs (Beckn-based)

### 12.1 Core Protocol Messages

| # | API | Method | Path | Direction | Description |
|---|---|---|---|---|---|
| 12.1 | Search | POST | `/search` | EUA → Gateway | Search for health services |
| 12.2 | On Search | POST | `/on_search` | HSPA → Gateway → EUA | Provider search results |
| 12.3 | Select | POST | `/select` | EUA → Gateway | Select provider/service |
| 12.4 | On Select | POST | `/on_select` | HSPA → Gateway → EUA | Availability confirmation |
| 12.5 | Init | POST | `/init` | EUA → Gateway | Initiate booking |
| 12.6 | On Init | POST | `/on_init` | HSPA → Gateway → EUA | Return quote |
| 12.7 | Confirm | POST | `/confirm` | EUA → Gateway | Confirm booking |
| 12.8 | On Confirm | POST | `/on_confirm` | HSPA → Gateway → EUA | Booking confirmed |
| 12.9 | Status | POST | `/status` | EUA → Gateway | Check booking status |
| 12.10 | On Status | POST | `/on_status` | HSPA → Gateway → EUA | Current status |
| 12.11 | Cancel | POST | `/cancel` | EUA → Gateway | Cancel booking |
| 12.12 | On Cancel | POST | `/on_cancel` | HSPA → Gateway → EUA | Cancellation confirmed |
| 12.13 | Update | POST | `/update` | EUA → Gateway | Update booking |
| 12.14 | On Update | POST | `/on_update` | HSPA → Gateway → EUA | Update confirmed |
| 12.15 | Rating | POST | `/rating` | EUA → Gateway | Submit rating |
| 12.16 | On Rating | POST | `/on_rating` | HSPA → Gateway → EUA | Rating acknowledged |
| 12.17 | Support | POST | `/support` | EUA → Gateway | Request support |
| 12.18 | On Support | POST | `/on_support` | HSPA → Gateway → EUA | Support response |

### 12.2 Security
- **Signing**: Ed25519 key pairs
- **Hash**: BLAKE2B-512
- **Header signing**: Required for all protocol messages

---

## 13. NHCX — National Health Claims Exchange APIs

### 13.1 Onboarding APIs
| # | API | Method | Description |
|---|---|---|---|
| 13.1 | Register Participant | POST | Register as NHCX participant |
| 13.2 | Verify Participant | GET | Verify registration status |
| 13.3 | Update Profile | PUT | Update participant profile |

### 13.2 Claims APIs
| # | API | Method | Description |
|---|---|---|---|
| 13.4 | Submit Claim | POST | Submit health insurance claim |
| 13.5 | Check Claim Status | GET | Check claim processing status |
| 13.6 | Query Benefits | POST | Query patient insurance benefits |
| 13.7 | Upload Documents | POST | Upload supporting claim documents |

---

## 14. API Summary Statistics

| API Group | Count |
|---|---|
| ABHA (M1) - Auth & Init | 5 |
| ABHA (M1) - Enrollment | 10 |
| ABHA (M1) - Login/Verify | 7 |
| ABHA (M1) - Find ABHA | 2 |
| ABHA (M1) - Profile | 11 |
| PHR App | 22 |
| Gateway (M2) - Common | 8 |
| HIP Linking (M2) | 9 |
| Data Flow (M2/M3) | 6 |
| Consent (M3) | 12 |
| Scan & Share | 3 |
| Scan & Pay | 8 |
| Running Token | 3 |
| HPR (Professional Registry) | 27 |
| HFR (Facility Registry) | 8 |
| UHI Protocol | 18 |
| NHCX | 7 |
| **Total** | **164** |
