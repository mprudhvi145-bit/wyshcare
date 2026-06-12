# Service Map

Generated: 2026-06-12

| Service | Domain | Dependencies |
|---------|--------|-------------|
| backend/scripts/scan-route-service-mismatches.mjs | WyshID | fs, path |
| backend/src/common/encryption/encryption.service.ts | WyshID | @nestjs/common, @nestjs/config, node:crypto |
| backend/src/common/encryption/field-encryption.service.ts | WyshID | ./encryption.service, @nestjs/common, @nestjs/config |
| backend/src/common/services/audit-log.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/common/services/data-retention.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/common/services/encryption-audit.service.ts | WyshID | @nestjs/common, node:crypto |
| backend/src/common/services/error-budget.service.ts | WyshID | @nestjs/common |
| backend/src/common/services/wysh-id.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common, node:crypto |
| backend/src/common/telemetry/otel-logger.service.ts | WyshID | ../../providers/observability/observability.service, @nestjs/common |
| backend/src/modules/abdm/abha.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/abdm/consent.service.ts | Consent | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/abdm/gateway.service.ts | WyshID | @nestjs/common, @nestjs/config |
| backend/src/modules/abdm/hfr.service.ts | WyshID | ../../common/services/audit-log.service, ./gateway.service, @nestjs/common |
| backend/src/modules/abdm/hip.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/abdm/hiu.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/abdm/hpr.service.ts | WyshID | ../../common/services/audit-log.service, ./gateway.service, @nestjs/common |
| backend/src/modules/admin/admin.service.ts | Admin | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/ai-lifestyle/ai-lifestyle.service.ts | AI | ../../providers/gemini/gemini.service, ../../providers/prisma/prisma.service, @nestjs/common, @nestjs/event-emitter, @prisma/client, crypto |
| backend/src/modules/ai-preventive/ai-preventive.service.ts | AI | ../../providers/prisma/prisma.service, ../ai/ai.service, @nestjs/common, @nestjs/event-emitter |
| backend/src/modules/ai-risk/services/ai-risk-prediction.service.ts | AI | ../../../providers/prisma/prisma.service, ../../digital-twin/engines/family-risk-engine.service, @nestjs/common, @nestjs/event-emitter, crypto |
| backend/src/modules/ai-risk/services/assessors/cardiovascular-risk.assessor.ts | AI | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common |
| backend/src/modules/ai-risk/services/assessors/diabetes-risk.assessor.ts | AI | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common |
| backend/src/modules/ai-risk/services/assessors/frailty-risk.assessor.ts | AI | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common |
| backend/src/modules/ai-risk/services/assessors/hypertension-risk.assessor.ts | AI | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common |
| backend/src/modules/ai-risk/services/assessors/kidney-disease-risk.assessor.ts | AI | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common |
| backend/src/modules/ai-risk/services/assessors/medication-adherence-risk.assessor.ts | AI | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common |
| backend/src/modules/ai-risk/services/assessors/mental-health-risk.assessor.ts | AI | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common |
| backend/src/modules/ai-risk/services/assessors/mortality-risk.assessor.ts | AI | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common |
| backend/src/modules/ai-risk/services/assessors/readmission-risk.assessor.ts | AI | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common |
| backend/src/modules/ai-risk/services/assessors/risk-assessor.interface.ts | AI | ../../interfaces/ai-risk.interface |
| backend/src/modules/ai/ai.service.ts | AI | ../../providers/ai/ai-orchestrator.service, ../../providers/prisma/prisma.service, @nestjs/common, @nestjs/event-emitter |
| backend/src/modules/ai/services/ai-copilot.service.ts | AI | ../../../providers/ai/ai-orchestrator.service, ../../../providers/prisma/prisma.service, ./ai-graph.service, @nestjs/common |
| backend/src/modules/ai/services/ai-graph.service.ts | AI | ../../../providers/prisma/prisma.service, ../constants/graph.constants, @nestjs/common, @prisma/client |
| backend/src/modules/ai/services/ai-intelligence.service.ts | AI | ../../../providers/ai/ai-orchestrator.service, ../../../providers/prisma/prisma.service, ./ai-graph.service, @nestjs/common |
| backend/src/modules/analytics/analytics.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/events/events.types, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/modules/auth/admin-auth.service.ts | Authentication | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @nestjs/jwt, argon2 |
| backend/src/modules/auth/auth.service.ts | Authentication | ../../common/services/audit-log.service, ../../common/services/wysh-id.service, ../../providers/prisma/prisma.service, ./sms.service, @nestjs/common, @nestjs/jwt, node:crypto |
| backend/src/modules/auth/doctor-auth.service.ts | Authentication | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, ./email.service, ./sms.service, @nestjs/common, @nestjs/jwt, node:crypto |
| backend/src/modules/auth/email.service.ts | Authentication | @nestjs/common |
| backend/src/modules/auth/sms.service.ts | Authentication | @nestjs/common, node:https |
| backend/src/modules/care-plans/care-plans.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/clinic-admin/admin-os.service.ts | Admin | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/modules/clinic-billing/billing.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/clinic-branding/clinic-branding.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/modules/clinic-reception/reception.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/clinical-twin/clinical-twin.service.ts | Clinical | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/consent/consent.service.ts | Consent | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, node:crypto |
| backend/src/modules/dashboard/dashboard.service.ts | Dashboard | ../../providers/prisma/prisma.service, ../ai/services/ai-graph.service, ../ai/services/ai-intelligence.service, ./health-score.service, @nestjs/common |
| backend/src/modules/dashboard/health-score.service.ts | Health | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/diagnostics/diagnostics.service.ts | WyshID | ../../providers/prisma/prisma.service, ../../providers/storage/storage.service, @nestjs/common, @prisma/client, node:crypto |
| backend/src/modules/digital-twin/digital-twin.service.ts | Digital Twin | ../../providers/prisma/prisma.service, ./engines/adherence-engine.service, ./engines/care-gap-engine.service, ./engines/family-risk-engine.service, ./engines/prediction-engine.service, ./engines/preventive-care-engine.service, ./engines/risk-engine-v4.service, ./engines/twin-context-engine.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/digital-twin/engines/adherence-engine.service.ts | Digital Twin | ../../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/digital-twin/engines/care-gap-engine.service.ts | Digital Twin | ../../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/digital-twin/engines/family-risk-engine.service.ts | Family | ../../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/digital-twin/engines/prediction-engine.service.ts | Digital Twin | ../../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/digital-twin/engines/preventive-care-engine.service.ts | Digital Twin | ../../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/digital-twin/engines/risk-engine-v4.service.ts | Digital Twin | ../../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/digital-twin/engines/twin-context-engine.service.ts | Digital Twin | ../../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/discovery/discovery.service.ts | Discovery | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/doctors/doctors.service.ts | Doctor | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/ehr/cds.service.ts | EHR | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/ehr/clinical-notes.service.ts | EHR | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/ehr/encounter.service.ts | EHR | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/ehr/orders.service.ts | EHR | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/ehr/patient-chart.service.ts | Patient | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/ehr/timeline.service.ts | EHR | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/modules/emergency/emergency.service.ts | Emergency | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/prisma/prisma.service, ./dto/create-emergency-contact.dto, ./dto/grant-access.dto, ./dto/share-location.dto, ./dto/update-emergency-contact.dto, ./dto/update-profile.dto, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/family/family.service.ts | Family | ../../common/services/wysh-id.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/modules/goals/goals.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/health-graph-v2/family-history.service.ts | Family | ../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/health-graph-v2/lifestyle.service.ts | Health Graph | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/health-graph-v2/prevention.service.ts | Health Graph | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/health-graph-v2/risk.service.ts | Health Graph | ../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/health-graph-v2/symptom.service.ts | Health Graph | ../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/health-graph-v2/wearables.service.ts | Health Graph | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/health-graph/health-graph.service.ts | Health Graph | ../../providers/ai/ai-provider.module, ../../providers/events/events.service, ../../providers/prisma/prisma.service, ../ai/services/ai-graph.service, @nestjs/common |
| backend/src/modules/health-score/health-score.service.ts | Health | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/events/events.types, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/modules/health-twin/health-twin.service.ts | Health | ../../providers/ai/ai-provider.module, ../../providers/events/events.service, ../../providers/prisma/prisma.service, ../ai/services/ai-graph.service, ../health-graph/health-graph.service, @nestjs/common |
| backend/src/modules/identity/identity.service.ts | Identity | ../../providers/prisma/prisma.service, @nestjs/common, qrcode |
| backend/src/modules/insurance/insurance.service.ts | Insurance | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/interoperability/interoperability.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/nhcx/nhcx.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, ./fhir-mapper, @nestjs/common, @prisma/client, node:crypto |
| backend/src/modules/notifications/notifications.service.ts | Notification | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/prisma/prisma.service, ./notifications.gateway, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/payments/payments.service.ts | Billing | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, ../../providers/razorpay/razorpay.service, @nestjs/common, @prisma/client |
| backend/src/modules/pharmacy/pharmacy.service.ts | Pharmacy | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/prescription/interaction-engine.service.ts | Prescription | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/prescription/prescription-pdf.service.ts | Prescription | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/prescription/prescription-qr.service.ts | Prescription | ../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/prescription/prescription.service.ts | Prescription | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/events/events.types, ../../providers/prisma/prisma.service, ./dto, ./interaction-engine.service, ./prescription-pdf.service, ./prescription-qr.service, @nestjs/common, crypto |
| backend/src/modules/provider-graph/provider-graph.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/provider-graph/referral.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/provider-graph/reputation.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/search/search.service.ts | WyshID | ../../common/dto/pagination.dto, ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/specialties/cardiology/cardiology.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/dental/dental.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/dermatology/dermatology.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/endocrinology/endocrinology.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/ent/ent.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/gastroenterology/gastroenterology.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/general-medicine/general-medicine.service.ts | WyshID | @nestjs/common |
| backend/src/modules/specialties/gynecology/gynecology.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/neurology/neurology.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/ophthalmology/ophthalmology.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/orthopedics/orthopedics.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/pediatrics/pediatrics.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/psychiatry/psychiatry.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/pulmonology/pulmonology.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/specialties/shared/specialty-base.service.ts | WyshID | ../../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/modules/specialties/urology/urology.service.ts | WyshID | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common |
| backend/src/modules/staff/staff.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/modules/telemedicine/consultation.service.ts | Telemedicine | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/events/events.types, ../../providers/livekit/livekit.service, ../../providers/prisma/prisma.service, ../ai/services/ai-copilot.service, ../ai/services/ai-graph.service, ../health-twin/health-twin.service, ../notifications/notifications.service, ../timeline/timeline.service, ./pre-consult-context.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/telemedicine/pre-consult-context.service.ts | Telemedicine | ../../providers/prisma/prisma.service, ../ai/services/ai-graph.service, ../health-twin/health-twin.service, @nestjs/common |
| backend/src/modules/telemedicine/telemedicine.service.ts | Telemedicine | ../../common/services/audit-log.service, ../../providers/livekit/livekit.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/modules/timeline/timeline.service.ts | Timeline | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client |
| backend/src/modules/vault/vault.service.ts | Health Locker | ../../common/encryption/encryption.service, ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, ../../providers/storage/storage.service, @nestjs/common, @prisma/client, node:crypto |
| backend/src/modules/workspace/lab.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/workspace/nurse.service.ts | WyshID | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto |
| backend/src/modules/workspace/pharmacy.service.ts | Pharmacy | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto |
| backend/src/modules/wysh/wysh.service.ts | WyshID | ../../providers/prisma/prisma.service, @nestjs/common |
| backend/src/providers/ai/ai-orchestrator.service.ts | AI | ../events/events.service, ../events/events.types, ../redis/redis.service, ./ai-provider.factory, ./ai-provider.module, ./ai.types, @nestjs/common, @nestjs/config |
| backend/src/providers/events/events.service.ts | WyshID | @nestjs/common, rxjs |
| backend/src/providers/gemini/gemini.service.ts | WyshID | ../ai/ai-orchestrator.service, @nestjs/common |
| backend/src/providers/jobs/job-queue.service.ts | WyshID | ../events/events.service, ../events/events.types, ../prisma/prisma.service, @nestjs/common |
| backend/src/providers/jobs/jobs.service.ts | WyshID | ../prisma/prisma.service, @nestjs/common |
| backend/src/providers/livekit/livekit.service.ts | WyshID | @nestjs/common, livekit-server-sdk |
| backend/src/providers/observability/observability.service.ts | WyshID | @nestjs/common |
| backend/src/providers/prisma/prisma.service.ts | Database | @nestjs/common, @prisma/client |
| backend/src/providers/razorpay/razorpay.service.ts | Billing | @nestjs/common, node:crypto, razorpay |
| backend/src/providers/redis/redis.service.ts | WyshID | @nestjs/common, ioredis |
| backend/src/providers/storage/storage.service.ts | WyshID | @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @nestjs/common, node:child_process, node:crypto, node:fs/promises, node:os, node:path, node:util |
| backend/src/test/auth.service.spec.ts | Testing | ../common/services/audit-log.service, ../common/services/wysh-id.service, ../modules/auth/auth.service, ../modules/auth/sms.service, ../providers/prisma/prisma.service, ./helpers, @nestjs/common, @nestjs/jwt, @nestjs/testing, node:assert/strict, node:test |
| backend/src/test/consent.service.spec.ts | Testing | ../common/services/audit-log.service, ../modules/consent/consent.service, ../providers/prisma/prisma.service, ./helpers, @nestjs/common, @nestjs/testing, node:assert/strict, node:test |
| backend/src/test/vault.service.spec.ts | Testing | ../common/encryption/encryption.service, ../common/services/audit-log.service, ../modules/vault/vault.service, ../providers/prisma/prisma.service, ../providers/storage/storage.service, ./helpers, @nestjs/testing, node:assert/strict, node:test |
