# API Map

Generated: 2026-06-12

| Endpoint | File | Domain |
|----------|------|--------|
| `abha/create` | backend/src/modules/abdm/abdm.controller.ts | WyshID |
| `abha/link` | backend/src/modules/abdm/abdm.controller.ts | WyshID |
| `abha/resolve` | backend/src/modules/abdm/abdm.controller.ts | WyshID |
| `abha/profile/:userId` | backend/src/modules/abdm/abdm.controller.ts | WyshID |
| `abha/request-otp` | backend/src/modules/abdm/abdm.controller.ts | WyshID |
| `abha/verify-otp` | backend/src/modules/abdm/abdm.controller.ts | WyshID |
| `abha/search` | backend/src/modules/abdm/abdm.controller.ts | WyshID |
| `overview` | backend/src/modules/admin/admin.controller.ts | Admin |
| `assess/:userId` | backend/src/modules/ai-lifestyle/ai-lifestyle.controller.ts | AI |
| `recommendations/:userId` | backend/src/modules/ai-lifestyle/ai-lifestyle.controller.ts | AI |
| `profile/:userId` | backend/src/modules/ai-lifestyle/ai-lifestyle.controller.ts | AI |
| `generate/:userId` | backend/src/modules/ai-preventive/ai-preventive.controller.ts | AI |
| `:userId` | backend/src/modules/ai-preventive/ai-preventive.controller.ts | AI |
| `assess` | backend/src/modules/ai-risk/controllers/ai-risk.controller.ts | AI |
| `history/:userId` | backend/src/modules/ai-risk/controllers/ai-risk.controller.ts | AI |
| `symptom-analysis` | backend/src/modules/ai/ai.controller.ts | AI |
| `report-summary` | backend/src/modules/ai/ai.controller.ts | AI |
| `:userId/metrics` | backend/src/modules/analytics/analytics.controller.ts | WyshID |
| `:userId/trend/:metric` | backend/src/modules/analytics/analytics.controller.ts | WyshID |
| `:userId/appointments` | backend/src/modules/analytics/analytics.controller.ts | WyshID |
| `:userId/health-score-trend` | backend/src/modules/analytics/analytics.controller.ts | WyshID |
| `:userId/summary` | backend/src/modules/analytics/analytics.controller.ts | WyshID |
| `login` | backend/src/modules/auth/admin-auth.controller.ts | Authentication |
| `mfa/setup` | backend/src/modules/auth/admin-auth.controller.ts | Authentication |
| `mfa/verify` | backend/src/modules/auth/admin-auth.controller.ts | Authentication |
| `mfa/disable` | backend/src/modules/auth/admin-auth.controller.ts | Authentication |
| `credentials` | backend/src/modules/auth/admin-auth.controller.ts | Authentication |
| `otp/request` | backend/src/modules/auth/auth.controller.ts | Authentication |
| `otp/verify` | backend/src/modules/auth/auth.controller.ts | Authentication |
| `refresh` | backend/src/modules/auth/auth.controller.ts | Authentication |
| `me` | backend/src/modules/auth/auth.controller.ts | Authentication |
| `logout` | backend/src/modules/auth/auth.controller.ts | Authentication |
| `sessions` | backend/src/modules/auth/auth.controller.ts | Authentication |
| `sessions/:sessionId/revoke` | backend/src/modules/auth/auth.controller.ts | Authentication |
| `otp/request` | backend/src/modules/auth/doctor-auth.controller.ts | Authentication |
| `otp/verify` | backend/src/modules/auth/doctor-auth.controller.ts | Authentication |
| `:id` | backend/src/modules/care-plans/care-plans.controller.ts | WyshID |
| `:id/status` | backend/src/modules/care-plans/care-plans.controller.ts | WyshID |
| `:id/milestones` | backend/src/modules/care-plans/care-plans.controller.ts | WyshID |
| `milestones/:id/complete` | backend/src/modules/care-plans/care-plans.controller.ts | WyshID |
| `:id/adherence` | backend/src/modules/care-plans/care-plans.controller.ts | WyshID |
| `:id/adherence` | backend/src/modules/care-plans/care-plans.controller.ts | WyshID |
| `dashboard/:clinicId` | backend/src/modules/clinic-admin/admin-os.controller.ts | Admin |
| `branches` | backend/src/modules/clinic-admin/admin-os.controller.ts | Admin |
| `analytics/:clinicId` | backend/src/modules/clinic-admin/admin-os.controller.ts | Admin |
| `staff/:clinicId` | backend/src/modules/clinic-admin/admin-os.controller.ts | Admin |
| `update/:clinicId` | backend/src/modules/clinic-admin/admin-os.controller.ts | Admin |
| `invoices/:clinicId` | backend/src/modules/clinic-billing/billing.controller.ts | WyshID |
| `invoices/:id/issue` | backend/src/modules/clinic-billing/billing.controller.ts | WyshID |
| `invoices/:id/payment` | backend/src/modules/clinic-billing/billing.controller.ts | WyshID |
| `invoices/:id/cancel` | backend/src/modules/clinic-billing/billing.controller.ts | WyshID |
| `invoices/:id` | backend/src/modules/clinic-billing/billing.controller.ts | WyshID |
| `invoices` | backend/src/modules/clinic-billing/billing.controller.ts | WyshID |
| `revenue/:clinicId` | backend/src/modules/clinic-billing/billing.controller.ts | WyshID |
| `:clinicId` | backend/src/modules/clinic-branding/clinic-branding.controller.ts | WyshID |
| `:clinicId` | backend/src/modules/clinic-branding/clinic-branding.controller.ts | WyshID |
| `:clinicId/templates` | backend/src/modules/clinic-branding/clinic-branding.controller.ts | WyshID |
| `:clinicId/templates` | backend/src/modules/clinic-branding/clinic-branding.controller.ts | WyshID |
| `templates/:templateId` | backend/src/modules/clinic-branding/clinic-branding.controller.ts | WyshID |
| `templates/:templateId` | backend/src/modules/clinic-branding/clinic-branding.controller.ts | WyshID |
| `schedule/:clinicId` | backend/src/modules/clinic-reception/reception.controller.ts | WyshID |
| `check-in/:appointmentId` | backend/src/modules/clinic-reception/reception.controller.ts | WyshID |
| `walk-in/:clinicId` | backend/src/modules/clinic-reception/reception.controller.ts | WyshID |
| `queue/:clinicId` | backend/src/modules/clinic-reception/reception.controller.ts | WyshID |
| `queue/prioritize/:clinicId` | backend/src/modules/clinic-reception/reception.controller.ts | WyshID |
| `queue/call/:queueEntryId` | backend/src/modules/clinic-reception/reception.controller.ts | WyshID |
| `queue/complete/:queueEntryId` | backend/src/modules/clinic-reception/reception.controller.ts | WyshID |
| `:clinicId` | backend/src/modules/clinical-twin/clinical-twin.controller.ts | Clinical |
| `:clinicId/funnel` | backend/src/modules/clinical-twin/clinical-twin.controller.ts | Clinical |
| `:clinicId/disease-trends` | backend/src/modules/clinical-twin/clinical-twin.controller.ts | Clinical |
| `:id/revoke` | backend/src/modules/consent/consent.controller.ts | Consent |
| `patient` | backend/src/modules/dashboard/dashboard.controller.ts | Dashboard |
| `partners` | backend/src/modules/diagnostics/diagnostics.controller.ts | WyshID |
| `orders` | backend/src/modules/diagnostics/diagnostics.controller.ts | WyshID |
| `orders` | backend/src/modules/diagnostics/diagnostics.controller.ts | WyshID |
| `reports` | backend/src/modules/diagnostics/diagnostics.controller.ts | WyshID |
| `reports/upload` | backend/src/modules/diagnostics/diagnostics.controller.ts | WyshID |
| `score` | backend/src/modules/digital-twin/digital-twin.controller.ts | Digital Twin |
| `predictions` | backend/src/modules/digital-twin/digital-twin.controller.ts | Digital Twin |
| `risks` | backend/src/modules/digital-twin/digital-twin.controller.ts | Digital Twin |
| `care-gaps` | backend/src/modules/digital-twin/digital-twin.controller.ts | Digital Twin |
| `recommendations` | backend/src/modules/digital-twin/digital-twin.controller.ts | Digital Twin |
| `recompute` | backend/src/modules/digital-twin/digital-twin.controller.ts | Digital Twin |
| `:userId` | backend/src/modules/digital-twin/digital-twin.controller.ts | Digital Twin |
| `recompute/:userId` | backend/src/modules/digital-twin/digital-twin.controller.ts | Digital Twin |
| `onboarding` | backend/src/modules/doctors/doctors.controller.ts | Doctor |
| `allergies/:patientId` | backend/src/modules/ehr/ehr.controller.ts | EHR |
| `allergies/detail/:id` | backend/src/modules/ehr/ehr.controller.ts | EHR |
| `allergies` | backend/src/modules/ehr/ehr.controller.ts | EHR |
| `allergies/:id` | backend/src/modules/ehr/ehr.controller.ts | EHR |
| `allergies/:id` | backend/src/modules/ehr/ehr.controller.ts | EHR |
| `allergies/stats` | backend/src/modules/ehr/ehr.controller.ts | EHR |
| `profile` | backend/src/modules/emergency/emergency.controller.ts | Emergency |
| `profile` | backend/src/modules/emergency/emergency.controller.ts | Emergency |
| `activate` | backend/src/modules/emergency/emergency.controller.ts | Emergency |
| `deactivate` | backend/src/modules/emergency/emergency.controller.ts | Emergency |
| `contacts` | backend/src/modules/emergency/emergency.controller.ts | Emergency |
| `contacts` | backend/src/modules/emergency/emergency.controller.ts | Emergency |
| `contacts/:id` | backend/src/modules/emergency/emergency.controller.ts | Emergency |
| `contacts/:id` | backend/src/modules/emergency/emergency.controller.ts | Emergency |
| `location` | backend/src/modules/emergency/emergency.controller.ts | Emergency |
| `:id` | backend/src/modules/goals/goals.controller.ts | WyshID |
| `:id` | backend/src/modules/goals/goals.controller.ts | WyshID |
| `:id/milestones` | backend/src/modules/goals/goals.controller.ts | WyshID |
| `:id/milestones` | backend/src/modules/goals/goals.controller.ts | WyshID |
| `:id/progress` | backend/src/modules/goals/goals.controller.ts | WyshID |
| `lifestyle/:userId` | backend/src/modules/health-graph-v2/health-graph-v2.controller.ts | Health Graph |
| `lifestyle/:userId` | backend/src/modules/health-graph-v2/health-graph-v2.controller.ts | Health Graph |
| `lifestyle/stats` | backend/src/modules/health-graph-v2/health-graph-v2.controller.ts | Health Graph |
| `symptoms` | backend/src/modules/health-graph-v2/health-graph-v2.controller.ts | Health Graph |
| `symptoms/:userId` | backend/src/modules/health-graph-v2/health-graph-v2.controller.ts | Health Graph |
| `symptoms/:id/resolve` | backend/src/modules/health-graph-v2/health-graph-v2.controller.ts | Health Graph |
| `symptoms/:userId/frequent` | backend/src/modules/health-graph-v2/health-graph-v2.controller.ts | Health Graph |
| `summary` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `risks` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `nodes` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `nodes/:nodeId` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `paths` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `query` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `sync/consultation/:consultationId` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `sync/lab-report/:reportId` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `sync/appointment/:appointmentId` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `sync/prescription/:prescriptionId` | backend/src/modules/health-graph/health-graph.controller.ts | Health Graph |
| `current` | backend/src/modules/health-score/health-score.controller.ts | Health |
| `history` | backend/src/modules/health-score/health-score.controller.ts | Health |
| `calculate` | backend/src/modules/health-score/health-score.controller.ts | Health |
| `breakdown` | backend/src/modules/health-score/health-score.controller.ts | Health |
| `:userId` | backend/src/modules/health-twin/health-twin.controller.ts | Health |
| `ask` | backend/src/modules/health-twin/health-twin.controller.ts | Health |
| `me` | backend/src/modules/identity/identity.controller.ts | Identity |
| `dashboard` | backend/src/modules/identity/identity.controller.ts | Identity |
| `qr` | backend/src/modules/identity/identity.controller.ts | Identity |
| `providers` | backend/src/modules/insurance/insurance.controller.ts | Insurance |
| `providers/:id` | backend/src/modules/insurance/insurance.controller.ts | Insurance |
| `providers` | backend/src/modules/insurance/insurance.controller.ts | Insurance |
| `providers/:id/plans` | backend/src/modules/insurance/insurance.controller.ts | Insurance |
| `plans` | backend/src/modules/insurance/insurance.controller.ts | Insurance |
| `plans/:id` | backend/src/modules/insurance/insurance.controller.ts | Insurance |
| `policies` | backend/src/modules/insurance/insurance.controller.ts | Insurance |
| `policies` | backend/src/modules/insurance/insurance.controller.ts | Insurance |
| `link` | backend/src/modules/interoperability/interoperability.controller.ts | WyshID |
| `providers/:providerId/configure` | backend/src/modules/nhcx/nhcx.controller.ts | WyshID |
| `providers/:providerId/configuration` | backend/src/modules/nhcx/nhcx.controller.ts | WyshID |
| `claims/:claimId/submit` | backend/src/modules/nhcx/nhcx.controller.ts | WyshID |
| `submissions/:submissionId/acknowledge` | backend/src/modules/nhcx/nhcx.controller.ts | WyshID |
| `submissions/:submissionId/sync` | backend/src/modules/nhcx/nhcx.controller.ts | WyshID |
| `stats` | backend/src/modules/nhcx/nhcx.controller.ts | WyshID |
| `submissions` | backend/src/modules/nhcx/nhcx.controller.ts | WyshID |
| `unread-count` | backend/src/modules/notifications/notifications.controller.ts | Notification |
| `:id/read` | backend/src/modules/notifications/notifications.controller.ts | Notification |
| `read-all` | backend/src/modules/notifications/notifications.controller.ts | Notification |
| `preferences` | backend/src/modules/notifications/notifications.controller.ts | Notification |
| `preferences` | backend/src/modules/notifications/notifications.controller.ts | Notification |
| `seed-templates` | backend/src/modules/notifications/notifications.controller.ts | Notification |
| `send` | backend/src/modules/notifications/notifications.controller.ts | Notification |
| `template` | backend/src/modules/notifications/notifications.controller.ts | Notification |
| `history` | backend/src/modules/notifications/notifications.controller.ts | Notification |
| `consultations` | backend/src/modules/payments/payments.controller.ts | Billing |
| `pharmacy/:orderId` | backend/src/modules/payments/payments.controller.ts | Billing |
| `webhooks/razorpay` | backend/src/modules/payments/payments.controller.ts | Billing |
| `:paymentOrderId/refund` | backend/src/modules/payments/payments.controller.ts | Billing |
| `partners` | backend/src/modules/pharmacy/pharmacy.controller.ts | Pharmacy |
| `orders` | backend/src/modules/pharmacy/pharmacy.controller.ts | Pharmacy |
| `orders` | backend/src/modules/pharmacy/pharmacy.controller.ts | Pharmacy |
| `:id/issue` | backend/src/modules/prescription/prescription.controller.ts | Prescription |
| `:id` | backend/src/modules/prescription/prescription.controller.ts | Prescription |
| `:id/cancel` | backend/src/modules/prescription/prescription.controller.ts | Prescription |
| `drugs` | backend/src/modules/prescription/prescription.controller.ts | Prescription |
| `nodes` | backend/src/modules/provider-graph/provider-graph.controller.ts | WyshID |
| `nodes/:id` | backend/src/modules/provider-graph/provider-graph.controller.ts | WyshID |
| `search` | backend/src/modules/provider-graph/provider-graph.controller.ts | WyshID |
| `traverse` | backend/src/modules/provider-graph/provider-graph.controller.ts | WyshID |
| `stats` | backend/src/modules/provider-graph/provider-graph.controller.ts | WyshID |
| `best-match` | backend/src/modules/provider-graph/provider-graph.controller.ts | WyshID |
| `edges` | backend/src/modules/provider-graph/provider-graph.controller.ts | WyshID |
| `referrals` | backend/src/modules/provider-graph/provider-graph.controller.ts | WyshID |
| `referrals/:id/respond` | backend/src/modules/provider-graph/provider-graph.controller.ts | WyshID |
| `stats` | backend/src/modules/queue-monitor/queue-monitor.controller.ts | WyshID |
| `stats/:queue` | backend/src/modules/queue-monitor/queue-monitor.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/cardiology/cardiology.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/cardiology/cardiology.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/cardiology/cardiology.controller.ts | WyshID |
| `tooth-chart` | backend/src/modules/specialties/dental/dental.controller.ts | WyshID |
| `procedures` | backend/src/modules/specialties/dental/dental.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/dental/dental.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/dental/dental.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/dental/dental.controller.ts | WyshID |
| `body-regions` | backend/src/modules/specialties/dermatology/dermatology.controller.ts | WyshID |
| `lesion-types` | backend/src/modules/specialties/dermatology/dermatology.controller.ts | WyshID |
| `procedures` | backend/src/modules/specialties/dermatology/dermatology.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/dermatology/dermatology.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/dermatology/dermatology.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/dermatology/dermatology.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/endocrinology/endocrinology.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/endocrinology/endocrinology.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/endocrinology/endocrinology.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/ent/ent.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/ent/ent.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/ent/ent.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/gastroenterology/gastroenterology.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/gastroenterology/gastroenterology.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/gastroenterology/gastroenterology.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/general-medicine/general-medicine.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/gynecology/gynecology.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/gynecology/gynecology.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/gynecology/gynecology.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/neurology/neurology.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/neurology/neurology.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/neurology/neurology.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/orthopedics/orthopedics.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/orthopedics/orthopedics.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/orthopedics/orthopedics.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/pediatrics/pediatrics.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/pediatrics/pediatrics.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/pediatrics/pediatrics.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/psychiatry/psychiatry.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/psychiatry/psychiatry.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/psychiatry/psychiatry.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/pulmonology/pulmonology.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/pulmonology/pulmonology.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/pulmonology/pulmonology.controller.ts | WyshID |
| `templates` | backend/src/modules/specialties/urology/urology.controller.ts | WyshID |
| `encounters` | backend/src/modules/specialties/urology/urology.controller.ts | WyshID |
| `history/:patientId` | backend/src/modules/specialties/urology/urology.controller.ts | WyshID |
| `dashboard` | backend/src/modules/staff/staff.controller.ts | WyshID |
| `appointments` | backend/src/modules/telemedicine/telemedicine.controller.ts | Telemedicine |
| `appointments` | backend/src/modules/telemedicine/telemedicine.controller.ts | Telemedicine |
| `appointments/:appointmentId/session` | backend/src/modules/telemedicine/telemedicine.controller.ts | Telemedicine |
| `records` | backend/src/modules/vault/vault.controller.ts | Health Locker |
| `records` | backend/src/modules/vault/vault.controller.ts | Health Locker |
| `records/upload` | backend/src/modules/vault/vault.controller.ts | Health Locker |
| `records/:recordId/download-url` | backend/src/modules/vault/vault.controller.ts | Health Locker |
| `records/:recordId/download` | backend/src/modules/vault/vault.controller.ts | Health Locker |
| `prescriptions` | backend/src/modules/vault/vault.controller.ts | Health Locker |
| `role/:userId` | backend/src/modules/workspace/workspace.controller.ts | WyshID |
| `nurse/vitals` | backend/src/modules/workspace/workspace.controller.ts | WyshID |
| `dashboard` | backend/src/modules/wysh/wysh.controller.ts | WyshID |
