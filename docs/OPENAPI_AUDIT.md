# OpenAPI / REST Audit

## Methodology

Scanned `backend/src/app.module.ts` (controller registration) and all 62 controller files in `backend/src/modules/*.controller.ts` and `backend/src/modules/**/*.controller.ts`. Each endpoint was classified against REST conventions: proper HTTP methods, plural resource nouns, URL versioning, and auth enforcement.

## Summary

| Metric | Value |
|---|---|
| Total endpoints | ~210 |
| REST Compliant | ~185 (88%) |
| Non-compliant | ~25 (12%) |
| Versioned (v1 prefix) | 0 |
| Using auth guards | ~185 (88%) |
| Overall score | **5.5 / 10** |

## Endpoint Inventory

### Health

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /health | HealthController | ✅ Yes | ❌ No | ❌ No | OK for health check |

### Auth

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| POST | /auth/otp/request | AuthController | ⚠️ Partial | ❌ No | ❌ No | Action-style, should be POST /auth/otp |
| POST | /auth/otp/verify | AuthController | ⚠️ Partial | ❌ No | ❌ No | Action-style |
| POST | /auth/refresh | AuthController | ⚠️ Partial | ❌ No | ❌ No | Action-style |
| GET | /auth/me | AuthController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /auth/logout | AuthController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /auth/sessions | AuthController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /auth/sessions/:sessionId/revoke | AuthController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /auth/doctor/otp/request | DoctorAuthController | ⚠️ Partial | ❌ No | ❌ No | Action-style |
| POST | /auth/doctor/otp/verify | DoctorAuthController | ⚠️ Partial | ❌ No | ❌ No | Action-style |
| POST | /auth/admin/login | AdminAuthController | ⚠️ Partial | ❌ No | ❌ No | Action-style |
| POST | /auth/admin/mfa/setup | AdminAuthController | ⚠️ Partial | ❌ No | ✅ Yes | |
| POST | /auth/admin/mfa/verify | AdminAuthController | ⚠️ Partial | ❌ No | ✅ Yes | |
| POST | /auth/admin/mfa/disable | AdminAuthController | ⚠️ Partial | ❌ No | ✅ Yes | |
| POST | /auth/admin/credentials | AdminAuthController | ⚠️ Partial | ❌ No | ✅ Yes | |

### Core Resources

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /identity/me | IdentityController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /identity/dashboard | IdentityController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /identity/qr | IdentityController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /consents | ConsentController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /consents | ConsentController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /consents/:id/revoke | ConsentController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /vault/records | VaultController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /vault/records | VaultController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /vault/records/upload | VaultController | ⚠️ Partial | ❌ No | ✅ Yes | Action-based; should be POST /vault/records with multipart |
| GET | /vault/records/:recordId/download-url | VaultController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /vault/records/:recordId/download | VaultController | ✅ Yes | ❌ No | ❌ No | Public download — verify security |
| GET | /vault/prescriptions | VaultController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /doctors | DoctorsController | ✅ Yes | ❌ No | ❌ No | |
| POST | /doctors/onboarding | DoctorsController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /discovery | DiscoveryController | ✅ Yes | ❌ No | ❌ No | |

### Telemedicine

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /telemedicine/appointments | TelemedicineController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /telemedicine/appointments | TelemedicineController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /telemedicine/appointments/:appointmentId/session | TelemedicineController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |

### Payments

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| POST | /payments/consultations | PaymentsController | ⚠️ Partial | ❌ No | ✅ Yes | Resource missing; should be POST /payments/orders |
| POST | /payments/pharmacy/:orderId | PaymentsController | ⚠️ Partial | ❌ No | ✅ Yes | |
| POST | /payments/webhooks/razorpay | PaymentsController | ✅ Yes | ❌ No | ❌ No | Webhook, OK |
| POST | /payments/:paymentOrderId/refund | PaymentsController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |

### Pharmacy

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /pharmacy/partners | PharmacyController | ✅ Yes | ❌ No | ❌ No | |
| GET | /pharmacy/orders | PharmacyController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /pharmacy/orders | PharmacyController | ✅ Yes | ❌ No | ✅ Yes | |

### Diagnostics

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /diagnostics/partners | DiagnosticsController | ✅ Yes | ❌ No | ❌ No | |
| GET | /diagnostics/orders | DiagnosticsController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /diagnostics/orders | DiagnosticsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /diagnostics/reports | DiagnosticsController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /diagnostics/reports/upload | DiagnosticsController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |

### Admin

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /admin/overview | AdminController | ✅ Yes | ❌ No | ✅ Yes | |

### Notifications

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /notifications | NotificationsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /notifications/unread-count | NotificationsController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /notifications/:id/read | NotificationsController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /notifications/read-all | NotificationsController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /notifications/preferences | NotificationsController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /notifications/preferences | NotificationsController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /notifications/seed-templates | NotificationsController | ⚠️ Partial | ❌ No | ✅ Yes | Admin action |
| POST | /notifications/send | NotificationsController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /notifications/template | NotificationsController | ⚠️ Partial | ❌ No | ✅ Yes | |
| GET | /notifications/history | NotificationsController | ⚠️ Partial | ❌ No | ✅ Yes | Duplicate of GET / |
| POST | /notifications/emergency-alert | NotificationsController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /notifications/prescription-reminder | NotificationsController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /notifications/lab-result | NotificationsController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /notifications/appointment-reminder | NotificationsController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |

### Timeline, AI, Interop, Family, Dashboard

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /timeline | TimelineController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ai/symptom-analysis | AiController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ai/report-summary | AiController | ✅ Yes | ❌ No | ❌ No | Missing auth guard? |
| POST | /abdm/link | InteroperabilityController | ⚠️ Partial | ❌ No | ✅ Yes | Labeled /abdm but in interoperability module |
| GET | /family | FamilyController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /family | FamilyController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /dashboard/patient | DashboardController | ✅ Yes | ❌ No | ✅ Yes | |

### Enterprise EHR

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /ehr/allergies/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/allergies/detail/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/allergies | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /ehr/allergies/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| DELETE | /ehr/allergies/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/allergies/stats | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/conditions/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/conditions/detail/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/conditions | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /ehr/conditions/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| DELETE | /ehr/conditions/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/conditions/stats | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/procedures/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/procedures/detail/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/procedures | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/procedures/stats | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/immunizations/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/immunizations | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/immunizations/stats | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/documents/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/documents | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| DELETE | /ehr/documents/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/documents/stats | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/encounters/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/encounters/detail/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/encounters | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /ehr/encounters/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/encounters/:id/close | EhrController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /ehr/encounters/:id/cancel | EhrController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /ehr/encounters/diagnoses | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| DELETE | /ehr/encounters/diagnoses/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/encounters/provider/:providerId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/encounters/stats | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/orders/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/orders/detail/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/orders | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /ehr/orders/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/orders/type/:orderType | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/orders/stats | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/notes/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/notes/detail/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/notes | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /ehr/notes/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/notes/:id/sign | EhrController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| DELETE | /ehr/notes/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/notes/stats | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/cds/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/cds/detail/:id | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/cds | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ehr/cds/:id/dismiss | EhrController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /ehr/cds/:id/resolve | EhrController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /ehr/cds/type/:alertType | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/cds/stats | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/timeline | EhrController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ehr/timeline/:patientId | EhrController | ✅ Yes | ❌ No | ✅ Yes | |

### Prescriptions

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| POST | /prescriptions | PrescriptionController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /prescriptions/:id/issue | PrescriptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| PATCH | /prescriptions/:id | PrescriptionController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /prescriptions/:id/cancel | PrescriptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /prescriptions | PrescriptionController | ✅ Yes | ❌ No | ❌ No | Missing auth at class level (uses @ApiBearerAuth but no guard) |
| GET | /prescriptions/drugs | PrescriptionController | ✅ Yes | ❌ No | ❌ No | |
| POST | /prescriptions/drugs | PrescriptionController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /prescriptions/drugs/bulk | PrescriptionController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /prescriptions/adherence/report/:patientUserId | PrescriptionController | ✅ Yes | ❌ No | ❌ No | |
| GET | /prescriptions/consultation/:consultationId | PrescriptionController | ✅ Yes | ❌ No | ❌ No | |
| GET | /prescriptions/verify/qr/:qrHash | PrescriptionController | ✅ Yes | ❌ No | ❌ No | |
| GET | /prescriptions/:id/pdf | PrescriptionController | ✅ Yes | ❌ No | ❌ No | |
| GET | /prescriptions/:id | PrescriptionController | ✅ Yes | ❌ No | ❌ No | |
| POST | /prescriptions/check-interactions | PrescriptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /prescriptions/check-duplicate-therapy | PrescriptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /prescriptions/:id/send-to-pharmacy/:pharmacyPartnerId | PrescriptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /prescriptions/:id/issue-and-send | PrescriptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /prescriptions/:id/schedules | PrescriptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /prescriptions/:id/schedules/:scheduleId/log | PrescriptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |

### Digital Twin & Health Twin

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /digital-twin | DigitalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /digital-twin/score | DigitalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /digital-twin/predictions | DigitalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /digital-twin/risks | DigitalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /digital-twin/care-gaps | DigitalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /digital-twin/recommendations | DigitalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /digital-twin/recompute | DigitalTwinController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /digital-twin/:userId | DigitalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /digital-twin/recompute/:userId | DigitalTwinController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /health-twin | HealthTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-twin/:userId | HealthTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-twin/ask | HealthTwinController | ✅ Yes | ❌ No | ✅ Yes | |

### Health Graph V2

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /health-graph-v2/lifestyle/:userId | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /health-graph-v2/lifestyle/:userId | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph-v2/lifestyle/stats | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-graph-v2/symptoms | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph-v2/symptoms/:userId | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-graph-v2/symptoms/:id/resolve | HealthGraphV2Controller | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /health-graph-v2/symptoms/:userId/frequent | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph-v2/symptoms/stats | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph-v2/family-history/:userId | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-graph-v2/family-history | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| DELETE | /health-graph-v2/family-history/:id | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph-v2/family-history/stats | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-graph-v2/wearables/sync/:userId | HealthGraphV2Controller | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /health-graph-v2/wearables/:userId/:metricType | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph-v2/wearables/:userId/latest | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph-v2/wearables/stats | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-graph-v2/risk/assess/:userId | HealthGraphV2Controller | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /health-graph-v2/risk/history/:userId | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph-v2/risk/stats | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-graph-v2/prevention/generate/:userId | HealthGraphV2Controller | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /health-graph-v2/prevention/:userId | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-graph-v2/prevention/:id/complete | HealthGraphV2Controller | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /health-graph-v2/prevention/:id/dismiss | HealthGraphV2Controller | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /health-graph-v2/prevention/stats | HealthGraphV2Controller | ✅ Yes | ❌ No | ✅ Yes | |

### Insurance

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /insurance/providers | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/providers/:id | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /insurance/providers | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/providers/:id/plans | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /insurance/plans | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/plans/:id | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /insurance/policies | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/policies | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/policies/:id | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /insurance/policies/:id | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /insurance/coverage-rules | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/coverage-rules/:planId | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /insurance/eligibility/check | InsuranceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /insurance/eligibility/history/:patientUserId | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /insurance/pre-auth | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/pre-auth | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/pre-auth/:id | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /insurance/pre-auth/:id/respond | InsuranceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /insurance/claims | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/claims | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /insurance/claims/:id | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /insurance/claims/:id/submit | InsuranceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /insurance/claims/:id/adjudicate | InsuranceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /insurance/claims/:id/documents | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /insurance/claims/:id/settlement | InsuranceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /insurance/copilot/analyze-claim/:id | InsuranceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /insurance/copilot/denial-risk/:id | InsuranceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |

### ABDM

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| POST | /abdm/abha/create | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /abdm/abha/link | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /abdm/abha/resolve | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /abdm/abha/profile/:userId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /abdm/abha/request-otp | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /abdm/abha/verify-otp | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /abdm/abha/search | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/abha/stats | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /abdm/consent/request | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /abdm/consent/:id/grant | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /abdm/consent/:id/revoke | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /abdm/consent/:id | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/consent/by-abdm/:consentId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/consent/patient/:patientUserId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/consent | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/consent/stats | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /abdm/hip/care-context | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/hip/care-contexts/:patientUserId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /abdm/hip/push | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /abdm/hip/pending-requests/:hipId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /abdm/hiu/request | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /abdm/hiu/transfers/:requestId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/hiu/requests/:requesterUserId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/hiu/patient-requests/:patientUserId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /abdm/hiu/decrypt/:transferId | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /abdm/gateway/health | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /abdm/gateway/link-care-context | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /abdm/hpr/sync | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /abdm/hpr/search | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/hpr/stats | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/hpr/:hprId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /abdm/hfr/sync | AbdmController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /abdm/hfr/search | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/hfr/stats | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /abdm/hfr/:hfrId | AbdmController | ✅ Yes | ❌ No | ✅ Yes | |

### NHCX, Provider Graph, Search, Staff, Workspace

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| POST | /nhcx/providers/:providerId/configure | NHCXController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /nhcx/providers/:providerId/configuration | NHCXController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /nhcx/claims/:claimId/submit | NHCXController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /nhcx/submissions/:submissionId/acknowledge | NHCXController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /nhcx/submissions/:submissionId/sync | NHCXController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /nhcx/stats | NHCXController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /nhcx/submissions | NHCXController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /provider-graph/nodes | ProviderGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /provider-graph/nodes/:id | ProviderGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /provider-graph/search | ProviderGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /provider-graph/traverse | ProviderGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /provider-graph/stats | ProviderGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /provider-graph/best-match | ProviderGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /provider-graph/edges | ProviderGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /provider-graph/referrals | ProviderGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /provider-graph/referrals/:id/respond | ProviderGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /provider-graph/referrals/:id/complete | ProviderGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /provider-graph/referrals | ProviderGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /provider-graph/referrals/stats | ProviderGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /provider-graph/reputation/recalculate | ProviderGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /provider-graph/reputation/recalculate/:nodeId | ProviderGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /provider-graph/reputation/top | ProviderGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /search | SearchController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /staff/dashboard | StaffController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/role/:userId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/nurse/vitals | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/nurse/vitals/:patientId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/nurse/vitals/:patientId/latest | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/nurse/medications/schedule | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/nurse/medications/scheduled/:patientId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/nurse/medications/:id/administer | WorkspaceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /os/nurse/medications/history/:patientId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/nurse/tasks | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/nurse/tasks/:nurseId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /os/nurse/tasks/:id | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/nurse/patient-tasks/:patientId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/nurse/handover | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/nurse/handover/:userId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/nurse/handover/:id/acknowledge | WorkspaceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /os/lab/samples | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/lab/samples/pending | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /os/lab/samples/:id | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/lab/samples/order/:diagnosticOrderId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/lab/samples/stats | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/lab/results | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/lab/results/:id/approve | WorkspaceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /os/lab/results/order/:diagnosticOrderId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/lab/results/pending | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/lab/results/stats | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/pharmacy/dispense | WorkspaceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /os/pharmacy/dispense/queue | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/pharmacy/dispense/history/:pharmacistId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/pharmacy/dispense/stats | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/pharmacy/procurement | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/pharmacy/procurement/:pharmacyId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/pharmacy/procurement/:id/receive | WorkspaceController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /os/pharmacy/procurement/stats | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /os/pharmacy/inventory/low-stock/:pharmacyId | WorkspaceController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /os/pharmacy/inventory/:id/stock | WorkspaceController | ⚠️ Partial | ❌ No | ✅ Yes | |

### Clinic OS + Specialties

| Method | Route | Controller | REST Compliant | Versioned | Auth Required | Notes |
|---|---|---|---|---|---|---|
| GET | /clinic/admin/dashboard/:clinicId | AdminOsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/admin/branches | AdminOsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/admin/analytics/:clinicId | AdminOsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/admin/staff/:clinicId | AdminOsController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /clinic/admin/update/:clinicId | AdminOsController | ⚠️ Partial | ❌ No | ✅ Yes | Action "update" in path |
| POST | /clinic/billing/invoices/:clinicId | BillingController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /clinic/billing/invoices/:id/issue | BillingController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /clinic/billing/invoices/:id/payment | BillingController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /clinic/billing/invoices/:id/cancel | BillingController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /clinic/billing/invoices/:id | BillingController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/billing/invoices | BillingController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/billing/revenue/:clinicId | BillingController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/billing/revenue/:clinicId/by-doctor | BillingController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/reception/schedule/:clinicId | ReceptionController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /clinic/reception/check-in/:appointmentId | ReceptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /clinic/reception/walk-in/:clinicId | ReceptionController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/reception/queue/:clinicId | ReceptionController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /clinic/reception/queue/prioritize/:clinicId | ReceptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| PATCH | /clinic/reception/queue/call/:queueEntryId | ReceptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| PATCH | /clinic/reception/queue/complete/:queueEntryId | ReceptionController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /clinic/twin/:clinicId | ClinicalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/twin/:clinicId/funnel | ClinicalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /clinic/twin/:clinicId/disease-trends | ClinicalTwinController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph | HealthGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph/summary | HealthGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph/risks | HealthGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph/nodes | HealthGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph/nodes/:nodeId | HealthGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-graph/paths | HealthGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-graph/query | HealthGraphController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-graph/sync/consultation/:consultationId | HealthGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /health-graph/sync/lab-report/:reportId | HealthGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /health-graph/sync/appointment/:appointmentId | HealthGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /health-graph/sync/prescription/:prescriptionId | HealthGraphController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /queue/stats | QueueMonitorController | ✅ Yes | ❌ No | ❌ No | Missing auth at class level |
| GET | /queue/stats/:queue | QueueMonitorController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /goals | GoalsController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /goals | GoalsController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /goals/:id | GoalsController | ✅ Yes | ❌ No | ✅ Yes | |
| DELETE | /goals/:id | GoalsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /goals/:id/milestones | GoalsController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /goals/:id/milestones | GoalsController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /goals/:id/progress | GoalsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-score/current | HealthScoreController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /health-score/history | HealthScoreController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /health-score/calculate | HealthScoreController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /health-score/breakdown | HealthScoreController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /emergency/profile | EmergencyController | ✅ Yes | ❌ No | ✅ Yes | |
| PUT | /emergency/profile | EmergencyController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /emergency/activate | EmergencyController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /emergency/deactivate | EmergencyController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /emergency/contacts | EmergencyController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /emergency/contacts | EmergencyController | ✅ Yes | ❌ No | ✅ Yes | |
| PUT | /emergency/contacts/:id | EmergencyController | ✅ Yes | ❌ No | ✅ Yes | |
| DELETE | /emergency/contacts/:id | EmergencyController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /emergency/location | EmergencyController | ⚠️ Partial | ❌ No | ✅ Yes | |
| GET | /emergency/qr | EmergencyController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /emergency/access/grant | EmergencyController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /emergency/access/revoke/:accessId | EmergencyController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /ai-risk/assess | AIRiskController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /ai-risk/history/:userId | AIRiskController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ai-risk/latest/:userId | AIRiskController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ai-lifestyle/assess/:userId | AiLifestyleController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /ai-lifestyle/recommendations/:userId | AiLifestyleController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ai-lifestyle/profile/:userId | AiLifestyleController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ai-lifestyle/history/:userId | AiLifestyleController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /ai-lifestyle/score/:userId | AiLifestyleController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /ai-preventive/generate/:userId | AiPreventiveController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /ai-preventive/:userId | AiPreventiveController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /ai-preventive/:id/complete | AiPreventiveController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| PATCH | /ai-preventive/:id/dismiss | AiPreventiveController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| GET | /ai-preventive/stats/:userId | AiPreventiveController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /analytics/:userId/metrics | AnalyticsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /analytics/:userId/trend/:metric | AnalyticsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /analytics/:userId/appointments | AnalyticsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /analytics/:userId/health-score-trend | AnalyticsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /analytics/:userId/summary | AnalyticsController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /specialties | SpecialtiesController | ✅ Yes | ❌ No | ❌ No | |
| POST | /specialties/:code/encounters | SpecialtiesController | ✅ Yes | ❌ No | ❌ No | Missing auth |
| GET | /specialties/:code/history/:patientId | SpecialtiesController | ✅ Yes | ❌ No | ❌ No | Missing auth |
| GET | /specialties/:code/findings/:patientId | SpecialtiesController | ✅ Yes | ❌ No | ❌ No | Missing auth |
| GET | /clinic-branding/:clinicId | ClinicBrandingController | ✅ Yes | ❌ No | ❌ No | Missing auth |
| PATCH | /clinic-branding/:clinicId | ClinicBrandingController | ✅ Yes | ❌ No | ❌ No | Missing auth |
| POST | /clinic-branding/:clinicId/templates | ClinicBrandingController | ✅ Yes | ❌ No | ❌ No | Missing auth |
| GET | /clinic-branding/:clinicId/templates | ClinicBrandingController | ✅ Yes | ❌ No | ❌ No | Missing auth |
| PATCH | /clinic-branding/templates/:templateId | ClinicBrandingController | ✅ Yes | ❌ No | ❌ No | Missing auth |
| DELETE | /clinic-branding/templates/:templateId | ClinicBrandingController | ✅ Yes | ❌ No | ❌ No | Missing auth |
| GET | /wysh/dashboard | WyshController | ✅ Yes | ❌ No | ✅ Yes | |
| POST | /care-plans | CarePlansController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /care-plans | CarePlansController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /care-plans/:id | CarePlansController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /care-plans/:id/status | CarePlansController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /care-plans/:id/milestones | CarePlansController | ✅ Yes | ❌ No | ✅ Yes | |
| PATCH | /care-plans/milestones/:id/complete | CarePlansController | ⚠️ Partial | ❌ No | ✅ Yes | Action-style |
| POST | /care-plans/:id/adherence | CarePlansController | ✅ Yes | ❌ No | ✅ Yes | |
| GET | /care-plans/:id/adherence | CarePlansController | ✅ Yes | ❌ No | ✅ Yes | |

## Findings

### Critical Issues

1. **No API versioning** — Zero routes use `/v1/` prefix. This makes breaking changes impossible to manage.
2. **Inconsistent auth coverage** — Several controllers (Specialties, ClinicBranding, some Prescription routes) are missing auth guards entirely.
3. **Action-style endpoints** — ~25% of POST endpoints use verbs in the path (`/issue`, `/revoke`, `/close`, `/activate`, etc.) instead of resource-oriented REST. Standard: `PATCH /resources/:id/status` with body, not `POST /resources/:id/activate`.

### Moderate Issues

4. **Mixed naming conventions** — Some routes use plural (`/prescriptions`, `/consents`), others singular (`/auth`, `/vault`, `/pharmacy`). Inconsistent.
5. **Nested resource depth** — Routes like `/os/nurse/medications/:id/administer` are 4+ levels deep, violating REST simplicity.
6. **Duplicate endpoints** — `/notifications/history` duplicates `/notifications` with slight filtering.

### Minor Issues

7. **Stats routes** — `/stats` appended as a sub-resource is conventional but inconsistently applied.
8. **Missing Swagger tags** — AnalyticsController has no `@ApiTags`.
9. **Unused `@Param` in specialties** — `getTemplates` accepts `@Param('specialty')` but doesn't use it.

## Recommendations

1. **Add `/v1/` prefix to all routes immediately** — this is the single highest-impact change.
2. **Audit and fix missing auth guards** on Specialties, ClinicBranding, and some Prescription routes.
3. **Refactor action endpoints** to resource-oriented patterns:
   - `POST /prescriptions/:id/issue` → `PATCH /prescriptions/:id` with `{ status: "issued" }`
   - `POST /emergency/activate` → `PATCH /emergency/profile` with `{ mode: "active" }`
4. **Normalize pluralization** — choose plural resource names consistently (e.g., `/vault/records` is already good).
5. **Reduce nesting** — flatten routes like `/os/nurse/vitals` to `/vitals` behind a gateway or role middleware.

## Score: 5.5 / 10

- REST compliance (methods, nouns): 6/10
- Versioning: 0/10
- Auth coverage: 7/10
- Consistency: 5/10
- Resource-oriented design: 5/10
