# File Dependency Map

Generated: 2026-06-12

| File | Imports | Imported By |
|------|---------|-------------|
| backend/eslint.config.mjs | @eslint/js, typescript-eslint | - |
| backend/scripts/auto-comment-invalid-routes.mjs | fs, path | - |
| backend/scripts/generate-openapi.ts | ../src/app.module, @nestjs/core, @nestjs/swagger, fs, path | - |
| backend/scripts/import-demo-data.ts | @prisma/client, dotenv | - |
| backend/scripts/import-fhir.ts | @prisma/client, dotenv, fs, path | - |
| backend/scripts/import-synthea.ts | @prisma/client, dotenv, fs, path | - |
| backend/scripts/scan-route-service-mismatches.mjs | fs, path | - |
| backend/src/app.module.ts | ./common/encryption/encryption.module, ./common/guards/jwt-auth.guard, ./common/guards/roles.guard, ./common/services/audit-log.service, ./health.controller, ./modules/abdm/abdm.module, ./modules/admin/admin.module, ./modules/ai-lifestyle/ai-lifestyle.module, ./modules/ai-preventive/ai-preventive.module, ./modules/ai-risk/ai-risk.module, ./modules/ai/ai.module, ./modules/analytics/analytics.module, ./modules/auth/auth.module, ./modules/care-plans/care-plans.module, ./modules/clinic-admin/admin-os.module, ./modules/clinic-billing/billing.module, ./modules/clinic-branding/clinic-branding.module, ./modules/clinic-reception/reception.module, ./modules/clinical-twin/clinical-twin.module, ./modules/consent/consent.module, ./modules/dashboard/dashboard.module, ./modules/diagnostics/diagnostics.module, ./modules/digital-twin/digital-twin.module, ./modules/discovery/discovery.module, ./modules/doctors/doctors.module, ./modules/ehr/ehr.module, ./modules/emergency/emergency.module, ./modules/family/family.module, ./modules/goals/goals.module, ./modules/health-graph-v2/health-graph-v2.module, ./modules/health-graph/health-graph.module, ./modules/health-score/health-score.module, ./modules/health-twin/health-twin.module, ./modules/identity/identity.module, ./modules/insurance/insurance.module, ./modules/interoperability/interoperability.module, ./modules/nhcx/nhcx.module, ./modules/notifications/notifications.module, ./modules/payments/payments.module, ./modules/pharmacy/pharmacy.module, ./modules/prescription/prescription.module, ./modules/provider-graph/provider-graph.module, ./modules/queue-monitor/queue-monitor.module, ./modules/search/search.module, ./modules/specialties/specialties.module, ./modules/staff/staff.module, ./modules/telemedicine/telemedicine.module, ./modules/timeline/timeline.module, ./modules/vault/vault.module, ./modules/workspace/workspace.module, ./modules/wysh/wysh.module, ./providers/ai/ai-orchestrator.module, ./providers/ai/ai-provider.module, ./providers/events/consumers/events-consumer.module, ./providers/events/events.module, ./providers/gemini/gemini.module, ./providers/jobs/jobs.module, ./providers/livekit/livekit.module, ./providers/observability/observability.module, ./providers/prisma/prisma.module, ./providers/rabbitmq/rabbitmq.module, ./providers/razorpay/razorpay.module, ./providers/redis/redis.module, ./providers/storage/storage.module, @nestjs/apollo, @nestjs/common, @nestjs/config, @nestjs/graphql, @nestjs/throttler | - |
| backend/src/common/decorators/current-user.decorator.ts | @nestjs/common | - |
| backend/src/common/decorators/public.decorator.ts | @nestjs/common | - |
| backend/src/common/decorators/roles.decorator.ts | @nestjs/common | - |
| backend/src/common/dto/pagination.dto.ts | @nestjs/swagger, class-transformer, class-validator | - |
| backend/src/common/encryption/encryption.module.ts | ./encryption.service, ./field-encryption.service, @nestjs/common | - |
| backend/src/common/encryption/encryption.service.ts | @nestjs/common, @nestjs/config, node:crypto | - |
| backend/src/common/encryption/field-encryption.service.ts | ./encryption.service, @nestjs/common, @nestjs/config | - |
| backend/src/common/filters/http-exception.filter.ts | @nestjs/common | - |
| backend/src/common/guards/jwt-auth.guard.ts | ../../providers/prisma/prisma.service, ../decorators/public.decorator, @nestjs/common, @nestjs/core, @nestjs/jwt | - |
| backend/src/common/guards/roles.guard.ts | ../decorators/roles.decorator, @nestjs/common, @nestjs/core | - |
| backend/src/common/interceptors/api-envelope.interceptor.ts | @nestjs/common, rxjs | - |
| backend/src/common/middleware/correlation-id.middleware.ts | node:crypto | - |
| backend/src/common/middleware/pii-classification.middleware.ts | ../security/pii-classifier | - |
| backend/src/common/middleware/request-id.middleware.ts | node:crypto | - |
| backend/src/common/security/csrf.ts | node:crypto | - |
| backend/src/common/services/audit-log.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/common/services/data-retention.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/common/services/encryption-audit.service.ts | @nestjs/common, node:crypto | - |
| backend/src/common/services/error-budget.service.ts | @nestjs/common | - |
| backend/src/common/services/wysh-id.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, node:crypto | - |
| backend/src/common/telemetry/otel-logger.service.ts | ../../providers/observability/observability.service, @nestjs/common | - |
| backend/src/common/telemetry/telemetry.module.ts | @nestjs/common | - |
| backend/src/common/telemetry/tracing.ts | @opentelemetry/api, @opentelemetry/auto-instrumentations-node, @opentelemetry/exporter-trace-otlp-http, @opentelemetry/resources, @opentelemetry/sdk-node, @opentelemetry/semantic-conventions | - |
| backend/src/config/env.ts | zod | - |
| backend/src/health.controller.ts | ./providers/prisma/prisma.service, ./providers/redis/redis.service, @nestjs/common | - |
| backend/src/main.ts | ./app.module, ./common/filters/http-exception.filter, ./common/interceptors/api-envelope.interceptor, ./common/middleware/correlation-id.middleware, ./common/middleware/request-id.middleware, @nestjs/common, @nestjs/core, @nestjs/swagger, cookie-parser, helmet | - |
| backend/src/modules/abdm/abdm.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./abha.service, ./consent.service, ./gateway.service, ./hfr.service, ./hip.service, ./hiu.service, ./hpr.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/abdm/abdm.module.ts | ../../common/services/audit-log.service, ./abdm.controller, ./abha.service, ./consent.service, ./gateway.service, ./hfr.service, ./hip.service, ./hiu.service, ./hpr.service, @nestjs/common | - |
| backend/src/modules/abdm/abha.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/abdm/consent.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/abdm/gateway.service.ts | @nestjs/common, @nestjs/config | - |
| backend/src/modules/abdm/hfr.service.ts | ../../common/services/audit-log.service, ./gateway.service, @nestjs/common | - |
| backend/src/modules/abdm/hip.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/abdm/hiu.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/abdm/hpr.service.ts | ../../common/services/audit-log.service, ./gateway.service, @nestjs/common | - |
| backend/src/modules/admin/admin.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./admin.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/admin/admin.module.ts | ./admin.controller, ./admin.service, @nestjs/common | - |
| backend/src/modules/admin/admin.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/ai-lifestyle/ai-lifestyle.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./ai-lifestyle.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/ai-lifestyle/ai-lifestyle.module.ts | ../../providers/gemini/gemini.service, ../../providers/prisma/prisma.service, ./ai-lifestyle.controller, ./ai-lifestyle.service, ./assessors/activity-assessor, ./assessors/nutrition-assessor, ./assessors/sleep-assessor, ./assessors/stress-assessor, ./assessors/substance-use-assessor, @nestjs/common | - |
| backend/src/modules/ai-lifestyle/ai-lifestyle.service.ts | ../../providers/gemini/gemini.service, ../../providers/prisma/prisma.service, @nestjs/common, @nestjs/event-emitter, @prisma/client, crypto | - |
| backend/src/modules/ai-lifestyle/assessors/activity-assessor.ts | @nestjs/common | - |
| backend/src/modules/ai-lifestyle/assessors/nutrition-assessor.ts | @nestjs/common | - |
| backend/src/modules/ai-lifestyle/assessors/sleep-assessor.ts | @nestjs/common | - |
| backend/src/modules/ai-lifestyle/assessors/stress-assessor.ts | @nestjs/common | - |
| backend/src/modules/ai-lifestyle/assessors/substance-use-assessor.ts | @nestjs/common | - |
| backend/src/modules/ai-preventive/ai-preventive.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ./ai-preventive.service, ./dto/complete-preventive-recommendation.dto, ./dto/generate-preventive-recommendations.dto, ./dto/get-preventive-recommendations.dto, @nestjs/common, @nestjs/swagger, @prisma/client | - |
| backend/src/modules/ai-preventive/ai-preventive.module.ts | ../../providers/prisma/prisma.module, ../ai/ai.module, ./ai-preventive.controller, ./ai-preventive.service, @nestjs/common, @nestjs/event-emitter | - |
| backend/src/modules/ai-preventive/ai-preventive.service.ts | ../../providers/prisma/prisma.service, ../ai/ai.service, @nestjs/common, @nestjs/event-emitter | - |
| backend/src/modules/ai-preventive/dto/generate-preventive-recommendations.dto.ts | class-validator | - |
| backend/src/modules/ai-preventive/dto/get-preventive-recommendations.dto.ts | class-validator | - |
| backend/src/modules/ai-risk/ai-risk.module.ts | ../../providers/prisma/prisma.module, ../digital-twin/engines/family-risk-engine.service, ./controllers/ai-risk.controller, ./services/ai-risk-prediction.service, @nestjs/common, @nestjs/event-emitter | - |
| backend/src/modules/ai-risk/controllers/ai-risk.controller.ts | ../../../common/decorators/roles.decorator, ../../../common/guards/jwt-auth.guard, ../dto/assess-risk.dto, ../services/ai-risk-prediction.service, @nestjs/common, @nestjs/swagger, @prisma/client | - |
| backend/src/modules/ai-risk/dto/assess-risk.dto.ts | class-validator | - |
| backend/src/modules/ai-risk/services/ai-risk-prediction.service.ts | ../../../providers/prisma/prisma.service, ../../digital-twin/engines/family-risk-engine.service, @nestjs/common, @nestjs/event-emitter, crypto | - |
| backend/src/modules/ai-risk/services/assessors/cardiovascular-risk.assessor.ts | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common | - |
| backend/src/modules/ai-risk/services/assessors/diabetes-risk.assessor.ts | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common | - |
| backend/src/modules/ai-risk/services/assessors/frailty-risk.assessor.ts | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common | - |
| backend/src/modules/ai-risk/services/assessors/hypertension-risk.assessor.ts | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common | - |
| backend/src/modules/ai-risk/services/assessors/kidney-disease-risk.assessor.ts | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common | - |
| backend/src/modules/ai-risk/services/assessors/medication-adherence-risk.assessor.ts | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common | - |
| backend/src/modules/ai-risk/services/assessors/mental-health-risk.assessor.ts | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common | - |
| backend/src/modules/ai-risk/services/assessors/mortality-risk.assessor.ts | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common | - |
| backend/src/modules/ai-risk/services/assessors/readmission-risk.assessor.ts | ../../interfaces/ai-risk.interface, ./risk-assessor.interface, @nestjs/common | - |
| backend/src/modules/ai-risk/services/assessors/risk-assessor.interface.ts | ../../interfaces/ai-risk.interface | - |
| backend/src/modules/ai/ai.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./ai.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/ai/ai.module.ts | ./ai.controller, ./ai.resolver, ./ai.service, ./services/ai-copilot.service, ./services/ai-graph.service, ./services/ai-intelligence.service, @nestjs/common | - |
| backend/src/modules/ai/ai.resolver.ts | ./ai.service, ./entities/symptom-analysis.entity, @nestjs/graphql | - |
| backend/src/modules/ai/ai.service.ts | ../../providers/ai/ai-orchestrator.service, ../../providers/prisma/prisma.service, @nestjs/common, @nestjs/event-emitter | - |
| backend/src/modules/ai/entities/symptom-analysis.entity.ts | @nestjs/graphql | - |
| backend/src/modules/ai/services/ai-copilot.service.ts | ../../../providers/ai/ai-orchestrator.service, ../../../providers/prisma/prisma.service, ./ai-graph.service, @nestjs/common | - |
| backend/src/modules/ai/services/ai-graph.service.ts | ../../../providers/prisma/prisma.service, ../constants/graph.constants, @nestjs/common, @prisma/client | - |
| backend/src/modules/ai/services/ai-intelligence.service.ts | ../../../providers/ai/ai-orchestrator.service, ../../../providers/prisma/prisma.service, ./ai-graph.service, @nestjs/common | - |
| backend/src/modules/analytics/analytics.controller.ts | ../../common/guards/jwt-auth.guard, ./analytics.service, @nestjs/common | - |
| backend/src/modules/analytics/analytics.module.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.module, ./analytics.controller, ./analytics.service, @nestjs/common | - |
| backend/src/modules/analytics/analytics.service.ts | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/events/events.types, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/auth/admin-auth.controller.ts | ../../common/decorators/current-user.decorator, ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./admin-auth.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/auth/admin-auth.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @nestjs/jwt, argon2 | - |
| backend/src/modules/auth/auth.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./auth.service, ./dto/login.dto, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/auth/auth.module.ts | ../../common/services/audit-log.service, ../../common/services/wysh-id.service, ../../providers/prisma/prisma.module, ./admin-auth.controller, ./admin-auth.service, ./auth.controller, ./auth.service, ./doctor-auth.controller, ./doctor-auth.service, ./email.service, ./sms.service, @nestjs/common, @nestjs/jwt | - |
| backend/src/modules/auth/auth.service.ts | ../../common/services/audit-log.service, ../../common/services/wysh-id.service, ../../providers/prisma/prisma.service, ./sms.service, @nestjs/common, @nestjs/jwt, node:crypto | - |
| backend/src/modules/auth/doctor-auth.controller.ts | ./doctor-auth.service, ./dto/doctor-auth.dto, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/auth/doctor-auth.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, ./email.service, ./sms.service, @nestjs/common, @nestjs/jwt, node:crypto | - |
| backend/src/modules/auth/dto/admin-auth.dto.ts | @nestjs/swagger, class-validator | - |
| backend/src/modules/auth/dto/doctor-auth.dto.ts | @nestjs/swagger, class-validator | - |
| backend/src/modules/auth/dto/login.dto.ts | @nestjs/swagger, class-validator | - |
| backend/src/modules/auth/email.service.ts | @nestjs/common | - |
| backend/src/modules/auth/sms.service.ts | @nestjs/common, node:https | - |
| backend/src/modules/care-plans/care-plans.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./care-plans.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/care-plans/care-plans.module.ts | ./care-plans.controller, ./care-plans.service, @nestjs/common | - |
| backend/src/modules/care-plans/care-plans.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/clinic-admin/admin-os.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./admin-os.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/clinic-admin/admin-os.module.ts | ./admin-os.controller, ./admin-os.service, @nestjs/common | - |
| backend/src/modules/clinic-admin/admin-os.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/clinic-billing/billing.controller.ts | ../../common/decorators/current-user.decorator, ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./billing.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/clinic-billing/billing.module.ts | ../../common/services/audit-log.service, ./billing.controller, ./billing.service, @nestjs/common | - |
| backend/src/modules/clinic-billing/billing.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/clinic-branding/clinic-branding.controller.ts | ./clinic-branding.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/clinic-branding/clinic-branding.module.ts | ../../providers/prisma/prisma.module, ./clinic-branding.controller, ./clinic-branding.service, @nestjs/common | - |
| backend/src/modules/clinic-branding/clinic-branding.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/clinic-reception/reception.controller.ts | ../../common/decorators/current-user.decorator, ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./reception.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/clinic-reception/reception.module.ts | ../../common/services/audit-log.service, ./reception.controller, ./reception.service, @nestjs/common | - |
| backend/src/modules/clinic-reception/reception.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/clinical-twin/clinical-twin.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./clinical-twin.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/clinical-twin/clinical-twin.module.ts | ./clinical-twin.controller, ./clinical-twin.service, @nestjs/common | - |
| backend/src/modules/clinical-twin/clinical-twin.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/consent/consent.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./consent.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/consent/consent.module.ts | ../../common/services/audit-log.service, ./consent.controller, ./consent.service, @nestjs/common | - |
| backend/src/modules/consent/consent.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, node:crypto | - |
| backend/src/modules/dashboard/dashboard.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./dashboard.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/dashboard/dashboard.module.ts | ../ai/ai.module, ./dashboard.controller, ./dashboard.service, ./health-score.service, @nestjs/common | - |
| backend/src/modules/dashboard/dashboard.service.ts | ../../providers/prisma/prisma.service, ../ai/services/ai-graph.service, ../ai/services/ai-intelligence.service, ./health-score.service, @nestjs/common | - |
| backend/src/modules/dashboard/health-score.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/diagnostics/diagnostics.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./diagnostics.service, @nestjs/common, @nestjs/platform-express, @nestjs/swagger | - |
| backend/src/modules/diagnostics/diagnostics.module.ts | ../../common/services/audit-log.service, ./diagnostics.controller, ./diagnostics.service, @nestjs/common | - |
| backend/src/modules/diagnostics/diagnostics.service.ts | ../../providers/prisma/prisma.service, ../../providers/storage/storage.service, @nestjs/common, @prisma/client, node:crypto | - |
| backend/src/modules/digital-twin/digital-twin.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./digital-twin.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/digital-twin/digital-twin.module.ts | ./digital-twin.controller, ./digital-twin.service, ./engines/adherence-engine.service, ./engines/care-gap-engine.service, ./engines/family-risk-engine.service, ./engines/prediction-engine.service, ./engines/preventive-care-engine.service, ./engines/risk-engine-v4.service, ./engines/twin-context-engine.service, @nestjs/common | - |
| backend/src/modules/digital-twin/digital-twin.service.ts | ../../providers/prisma/prisma.service, ./engines/adherence-engine.service, ./engines/care-gap-engine.service, ./engines/family-risk-engine.service, ./engines/prediction-engine.service, ./engines/preventive-care-engine.service, ./engines/risk-engine-v4.service, ./engines/twin-context-engine.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/digital-twin/engines/adherence-engine.service.ts | ../../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/digital-twin/engines/care-gap-engine.service.ts | ../../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/digital-twin/engines/family-risk-engine.service.ts | ../../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/digital-twin/engines/prediction-engine.service.ts | ../../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/digital-twin/engines/preventive-care-engine.service.ts | ../../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/digital-twin/engines/risk-engine-v4.service.ts | ../../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/digital-twin/engines/twin-context-engine.service.ts | ../../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/discovery/discovery.controller.ts | ./discovery.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/discovery/discovery.module.ts | ./discovery.controller, ./discovery.resolver, ./discovery.service, @nestjs/common | - |
| backend/src/modules/discovery/discovery.resolver.ts | ./discovery.service, ./entities/discovery-result.entity, @nestjs/graphql | - |
| backend/src/modules/discovery/discovery.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/discovery/entities/discovery-result.entity.ts | @nestjs/graphql | - |
| backend/src/modules/doctors/doctors.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./doctors.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/doctors/doctors.module.ts | ./doctors.controller, ./doctors.service, @nestjs/common | - |
| backend/src/modules/doctors/doctors.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/ehr/cds.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/ehr/clinical-notes.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/ehr/dto/ehr.dto.ts | @prisma/client | - |
| backend/src/modules/ehr/ehr.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./cds.service, ./clinical-notes.service, ./encounter.service, ./orders.service, ./patient-chart.service, ./timeline.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/ehr/ehr.module.ts | ../../common/services/audit-log.service, ./cds.service, ./clinical-notes.service, ./ehr.controller, ./encounter.service, ./orders.service, ./patient-chart.service, ./timeline.service, @nestjs/common | - |
| backend/src/modules/ehr/encounter.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/ehr/orders.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/ehr/patient-chart.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/ehr/timeline.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/emergency/dto/create-emergency-contact.dto.ts | class-validator | - |
| backend/src/modules/emergency/dto/grant-access.dto.ts | @prisma/client, class-validator | - |
| backend/src/modules/emergency/dto/share-location.dto.ts | class-validator | - |
| backend/src/modules/emergency/dto/update-emergency-contact.dto.ts | class-validator | - |
| backend/src/modules/emergency/dto/update-profile.dto.ts | class-validator | - |
| backend/src/modules/emergency/emergency.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./dto/create-emergency-contact.dto, ./dto/grant-access.dto, ./dto/share-location.dto, ./dto/update-emergency-contact.dto, ./dto/update-profile.dto, ./emergency.service, @nestjs/swagger | - |
| backend/src/modules/emergency/emergency.module.ts | ../../common/services/audit-log.service, ../../providers/events/events.module, ../../providers/prisma/prisma.module, ./emergency.controller, ./emergency.service, @nestjs/common | - |
| backend/src/modules/emergency/emergency.service.ts | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/prisma/prisma.service, ./dto/create-emergency-contact.dto, ./dto/grant-access.dto, ./dto/share-location.dto, ./dto/update-emergency-contact.dto, ./dto/update-profile.dto, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/family/family.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./family.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/family/family.module.ts | ../../common/services/wysh-id.service, ./family.controller, ./family.service, @nestjs/common | - |
| backend/src/modules/family/family.service.ts | ../../common/services/wysh-id.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/goals/dto/create-goal.dto.ts | @nestjs/swagger, class-validator | - |
| backend/src/modules/goals/goals.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./dto/create-goal.dto, ./goals.service, @nestjs/swagger | - |
| backend/src/modules/goals/goals.module.ts | ../../common/services/audit-log.service, ./goals.controller, ./goals.service, @nestjs/common | - |
| backend/src/modules/goals/goals.service.ts | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/health-graph-v2/family-history.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/health-graph-v2/health-graph-v2.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./family-history.service, ./lifestyle.service, ./prevention.service, ./risk.service, ./symptom.service, ./wearables.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/health-graph-v2/health-graph-v2.module.ts | ./family-history.service, ./health-graph-v2.controller, ./lifestyle.service, ./prevention.service, ./risk.service, ./symptom.service, ./wearables.service, @nestjs/common | - |
| backend/src/modules/health-graph-v2/lifestyle.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/health-graph-v2/prevention.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/health-graph-v2/risk.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/health-graph-v2/symptom.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/health-graph-v2/wearables.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/health-graph/health-graph.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./health-graph.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/health-graph/health-graph.module.ts | ../ai/ai.module, ./health-graph.controller, ./health-graph.service, @nestjs/common | - |
| backend/src/modules/health-graph/health-graph.service.ts | ../../providers/ai/ai-provider.module, ../../providers/events/events.service, ../../providers/prisma/prisma.service, ../ai/services/ai-graph.service, @nestjs/common | - |
| backend/src/modules/health-score/dto/calculate-score.dto.ts | @nestjs/swagger, class-validator | - |
| backend/src/modules/health-score/health-score.controller.ts | ../../common/decorators/current-user.decorator, ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./dto/calculate-score.dto, ./health-score.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/health-score/health-score.module.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.module, ./health-score.controller, ./health-score.service, @nestjs/common | - |
| backend/src/modules/health-score/health-score.service.ts | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/events/events.types, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/health-twin/health-twin.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./health-twin.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/health-twin/health-twin.module.ts | ../ai/ai.module, ../health-graph/health-graph.module, ./health-twin.controller, ./health-twin.service, @nestjs/common | - |
| backend/src/modules/health-twin/health-twin.service.ts | ../../providers/ai/ai-provider.module, ../../providers/events/events.service, ../../providers/prisma/prisma.service, ../ai/services/ai-graph.service, ../health-graph/health-graph.service, @nestjs/common | - |
| backend/src/modules/identity/identity.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./identity.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/identity/identity.module.ts | ../../common/services/audit-log.service, ./identity.controller, ./identity.service, @nestjs/common | - |
| backend/src/modules/identity/identity.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, qrcode | - |
| backend/src/modules/insurance/insurance.controller.ts | ../../common/decorators/current-user.decorator, ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./insurance.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/insurance/insurance.module.ts | ../../common/services/audit-log.service, ./insurance.controller, ./insurance.service, @nestjs/common | - |
| backend/src/modules/insurance/insurance.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/interoperability/interoperability.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./interoperability.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/interoperability/interoperability.module.ts | ./interoperability.controller, ./interoperability.service, @nestjs/common | - |
| backend/src/modules/interoperability/interoperability.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/nhcx/nhcx.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./nhcx.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/nhcx/nhcx.module.ts | ../../common/services/audit-log.service, ./nhcx.controller, ./nhcx.service, @nestjs/common | - |
| backend/src/modules/nhcx/nhcx.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, ./fhir-mapper, @nestjs/common, @prisma/client, node:crypto | - |
| backend/src/modules/notifications/dto/create-template.dto.ts | @prisma/client, class-validator | - |
| backend/src/modules/notifications/dto/send-notification.dto.ts | class-transformer, class-validator | - |
| backend/src/modules/notifications/notifications.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./dto/create-template.dto, ./dto/send-notification.dto, ./notifications.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/notifications/notifications.gateway.ts | @nestjs/websockets, socket.io | - |
| backend/src/modules/notifications/notifications.module.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.module, ./notifications.controller, ./notifications.gateway, ./notifications.service, @nestjs/common | - |
| backend/src/modules/notifications/notifications.service.ts | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/prisma/prisma.service, ./notifications.gateway, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/payments/payments.controller.ts | ../../common/decorators/current-user.decorator, ../../common/decorators/public.decorator, ../../common/guards/jwt-auth.guard, ./payments.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/payments/payments.module.ts | ../../common/services/audit-log.service, ./payments.controller, ./payments.service, @nestjs/common | - |
| backend/src/modules/payments/payments.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, ../../providers/razorpay/razorpay.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/pharmacy/pharmacy.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./pharmacy.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/pharmacy/pharmacy.module.ts | ./pharmacy.controller, ./pharmacy.service, @nestjs/common | - |
| backend/src/modules/pharmacy/pharmacy.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/prescription/dto/create-prescription.dto.ts | class-transformer, class-validator | - |
| backend/src/modules/prescription/dto/interaction-query.dto.ts | class-validator | - |
| backend/src/modules/prescription/dto/update-prescription.dto.ts | ./create-prescription.dto, class-transformer, class-validator | - |
| backend/src/modules/prescription/interaction-engine.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/prescription/prescription-pdf.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/prescription/prescription-qr.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/prescription/prescription.controller.ts | ../../common/decorators/current-user.decorator, ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ../../providers/prisma/prisma.service, ./interaction-engine.service, ./prescription.service, @nestjs/swagger | - |
| backend/src/modules/prescription/prescription.module.ts | ../../common/services/audit-log.service, ../../providers/events/events.module, ../../providers/prisma/prisma.module, ../ai/ai.module, ./interaction-engine.service, ./prescription-pdf.service, ./prescription-qr.service, ./prescription.controller, ./prescription.service, @nestjs/common | - |
| backend/src/modules/prescription/prescription.service.ts | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/events/events.types, ../../providers/prisma/prisma.service, ./dto, ./interaction-engine.service, ./prescription-pdf.service, ./prescription-qr.service, @nestjs/common, crypto | - |
| backend/src/modules/provider-graph/provider-graph.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ./provider-graph.service, ./referral.service, ./reputation.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/provider-graph/provider-graph.module.ts | ../../common/services/audit-log.service, ./provider-graph.controller, ./provider-graph.service, ./referral.service, ./reputation.service, @nestjs/common | - |
| backend/src/modules/provider-graph/provider-graph.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/provider-graph/referral.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/provider-graph/reputation.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/queue-monitor/queue-monitor.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/roles.guard, ../../providers/jobs/job-queue.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/queue-monitor/queue-monitor.module.ts | ./queue-monitor.controller, @nestjs/common | - |
| backend/src/modules/search/search.controller.ts | ../../common/decorators/current-user.decorator, ../../common/dto/pagination.dto, ../../common/guards/jwt-auth.guard, ./search.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/search/search.module.ts | ./search.controller, ./search.service, @nestjs/common | - |
| backend/src/modules/search/search.service.ts | ../../common/dto/pagination.dto, ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/specialties/cardiology/cardiology.controller.ts | ./cardiology.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/cardiology/cardiology.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./cardiology.controller, ./cardiology.service, @nestjs/common | - |
| backend/src/modules/specialties/cardiology/cardiology.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/dental/dental.controller.ts | ./dental.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/dental/dental.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./dental.controller, ./dental.service, @nestjs/common | - |
| backend/src/modules/specialties/dental/dental.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/dermatology/dermatology.controller.ts | ./dermatology.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/dermatology/dermatology.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./dermatology.controller, ./dermatology.service, @nestjs/common | - |
| backend/src/modules/specialties/dermatology/dermatology.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/endocrinology/endocrinology.controller.ts | ./endocrinology.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/endocrinology/endocrinology.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./endocrinology.controller, ./endocrinology.service, @nestjs/common | - |
| backend/src/modules/specialties/endocrinology/endocrinology.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/ent/ent.controller.ts | ./ent.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/ent/ent.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./ent.controller, ./ent.service, @nestjs/common | - |
| backend/src/modules/specialties/ent/ent.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/gastroenterology/gastroenterology.controller.ts | ./gastroenterology.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/gastroenterology/gastroenterology.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./gastroenterology.controller, ./gastroenterology.service, @nestjs/common | - |
| backend/src/modules/specialties/gastroenterology/gastroenterology.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/general-medicine/general-medicine.controller.ts | ./general-medicine.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/general-medicine/general-medicine.module.ts | ./general-medicine.controller, ./general-medicine.service, @nestjs/common | - |
| backend/src/modules/specialties/general-medicine/general-medicine.service.ts | @nestjs/common | - |
| backend/src/modules/specialties/gynecology/gynecology.controller.ts | ./gynecology.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/gynecology/gynecology.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./gynecology.controller, ./gynecology.service, @nestjs/common | - |
| backend/src/modules/specialties/gynecology/gynecology.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/neurology/neurology.controller.ts | ./neurology.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/neurology/neurology.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./neurology.controller, ./neurology.service, @nestjs/common | - |
| backend/src/modules/specialties/neurology/neurology.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts | ./ophthalmology.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/ophthalmology/ophthalmology.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./ophthalmology.controller, ./ophthalmology.service, @nestjs/common | - |
| backend/src/modules/specialties/ophthalmology/ophthalmology.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/orthopedics/orthopedics.controller.ts | ./orthopedics.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/orthopedics/orthopedics.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./orthopedics.controller, ./orthopedics.service, @nestjs/common | - |
| backend/src/modules/specialties/orthopedics/orthopedics.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/pediatrics/pediatrics.controller.ts | ./pediatrics.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/pediatrics/pediatrics.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./pediatrics.controller, ./pediatrics.service, @nestjs/common | - |
| backend/src/modules/specialties/pediatrics/pediatrics.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/psychiatry/psychiatry.controller.ts | ./psychiatry.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/psychiatry/psychiatry.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./psychiatry.controller, ./psychiatry.service, @nestjs/common | - |
| backend/src/modules/specialties/psychiatry/psychiatry.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/pulmonology/pulmonology.controller.ts | ./pulmonology.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/pulmonology/pulmonology.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./pulmonology.controller, ./pulmonology.service, @nestjs/common | - |
| backend/src/modules/specialties/pulmonology/pulmonology.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/shared/dto/specialty.dto.ts | class-validator | - |
| backend/src/modules/specialties/shared/specialty-base.module.ts | ../../../providers/prisma/prisma.module, ./specialty-base.service, @nestjs/common | - |
| backend/src/modules/specialties/shared/specialty-base.service.ts | ../../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/specialties/specialties.controller.ts | ./cardiology/cardiology.service, ./dental/dental.service, ./dermatology/dermatology.service, ./endocrinology/endocrinology.service, ./ent/ent.service, ./gastroenterology/gastroenterology.service, ./gynecology/gynecology.service, ./neurology/neurology.service, ./ophthalmology/ophthalmology.service, ./orthopedics/orthopedics.service, ./pediatrics/pediatrics.service, ./psychiatry/psychiatry.service, ./pulmonology/pulmonology.service, ./shared/dto/specialty.dto, ./shared/specialty-base.service, ./urology/urology.service, @nestjs/common, @nestjs/core, @nestjs/swagger | - |
| backend/src/modules/specialties/specialties.module.ts | ./cardiology/cardiology.module, ./dental/dental.module, ./dermatology/dermatology.module, ./endocrinology/endocrinology.module, ./ent/ent.module, ./gastroenterology/gastroenterology.module, ./general-medicine/general-medicine.module, ./gynecology/gynecology.module, ./neurology/neurology.module, ./ophthalmology/ophthalmology.module, ./orthopedics/orthopedics.module, ./pediatrics/pediatrics.module, ./psychiatry/psychiatry.module, ./pulmonology/pulmonology.module, ./shared/specialty-base.module, ./specialties.controller, ./urology/urology.module, @nestjs/common | - |
| backend/src/modules/specialties/urology/urology.controller.ts | ./urology.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/specialties/urology/urology.module.ts | ../../../providers/prisma/prisma.module, ../shared/specialty-base.module, ./urology.controller, ./urology.service, @nestjs/common | - |
| backend/src/modules/specialties/urology/urology.service.ts | ../../../providers/prisma/prisma.service, ../shared/specialty-base.service, @nestjs/common | - |
| backend/src/modules/staff/staff.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./staff.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/staff/staff.module.ts | ./staff.controller, ./staff.service, @nestjs/common | - |
| backend/src/modules/staff/staff.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/modules/telemedicine/consultation.service.ts | ../../common/services/audit-log.service, ../../providers/events/events.service, ../../providers/events/events.types, ../../providers/livekit/livekit.service, ../../providers/prisma/prisma.service, ../ai/services/ai-copilot.service, ../ai/services/ai-graph.service, ../health-twin/health-twin.service, ../notifications/notifications.service, ../timeline/timeline.service, ./pre-consult-context.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/telemedicine/dto/create-appointment.dto.ts | class-validator | - |
| backend/src/modules/telemedicine/pre-consult-context.service.ts | ../../providers/prisma/prisma.service, ../ai/services/ai-graph.service, ../health-twin/health-twin.service, @nestjs/common | - |
| backend/src/modules/telemedicine/telemedicine.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./dto/create-appointment.dto, ./telemedicine.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/telemedicine/telemedicine.module.ts | ../../common/services/audit-log.service, ../ai/ai.module, ../health-twin/health-twin.module, ../notifications/notifications.module, ../timeline/timeline.module, ./consultation.service, ./pre-consult-context.service, ./telemedicine.controller, ./telemedicine.service, @nestjs/common | - |
| backend/src/modules/telemedicine/telemedicine.service.ts | ../../common/services/audit-log.service, ../../providers/livekit/livekit.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/timeline/timeline.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./timeline.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/timeline/timeline.module.ts | ./timeline.controller, ./timeline.service, @nestjs/common | - |
| backend/src/modules/timeline/timeline.service.ts | ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client | - |
| backend/src/modules/vault/vault.controller.ts | ../../common/decorators/current-user.decorator, ../../common/decorators/public.decorator, ../../common/guards/jwt-auth.guard, ./vault.service, @nestjs/platform-express, @nestjs/swagger | - |
| backend/src/modules/vault/vault.module.ts | ../../common/services/audit-log.service, ./vault.controller, ./vault.service, @nestjs/common | - |
| backend/src/modules/vault/vault.service.ts | ../../common/encryption/encryption.service, ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, ../../providers/storage/storage.service, @nestjs/common, @prisma/client, node:crypto | - |
| backend/src/modules/workspace/lab.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/workspace/nurse.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, @prisma/client, crypto | - |
| backend/src/modules/workspace/pharmacy.service.ts | ../../common/services/audit-log.service, ../../providers/prisma/prisma.service, @nestjs/common, crypto | - |
| backend/src/modules/workspace/workspace.controller.ts | ../../common/decorators/roles.decorator, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ../../providers/prisma/prisma.service, ./lab.service, ./nurse.service, ./pharmacy.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/workspace/workspace.module.ts | ../../common/services/audit-log.service, ./lab.service, ./nurse.service, ./pharmacy.service, ./workspace.controller, @nestjs/common | - |
| backend/src/modules/wysh/wysh.controller.ts | ../../common/decorators/current-user.decorator, ../../common/guards/jwt-auth.guard, ./wysh.service, @nestjs/common, @nestjs/swagger | - |
| backend/src/modules/wysh/wysh.module.ts | ./wysh.controller, ./wysh.service, @nestjs/common | - |
| backend/src/modules/wysh/wysh.service.ts | ../../providers/prisma/prisma.service, @nestjs/common | - |
| backend/src/providers/ai/ai-orchestrator.module.ts | ./ai-orchestrator.service, ./ai-provider.module, @nestjs/common | - |
| backend/src/providers/ai/ai-orchestrator.service.ts | ../events/events.service, ../events/events.types, ../redis/redis.service, ./ai-provider.factory, ./ai-provider.module, ./ai.types, @nestjs/common, @nestjs/config | - |
| backend/src/providers/ai/ai-provider.factory.ts | ./ai.types, ./providers/gemini.provider, ./providers/nvidia-nim.provider, ./providers/ollama.provider, ./providers/openai.provider, ./providers/openrouter.provider | - |
| backend/src/providers/ai/ai-provider.module.ts | ./ai-provider.factory, ./ai.types, @nestjs/common | - |
| backend/src/providers/ai/providers/gemini.provider.ts | ../ai.types, @google/generative-ai | - |
| backend/src/providers/ai/providers/nvidia-nim.provider.ts | ../ai.types, openai | - |
| backend/src/providers/ai/providers/ollama.provider.ts | ../ai.types | - |
| backend/src/providers/ai/providers/openai.provider.ts | ../ai.types, openai | - |
| backend/src/providers/ai/providers/openrouter.provider.ts | ../ai.types, openai | - |
| backend/src/providers/events/consumers/analytics-event.handler.ts | ../../../modules/analytics/analytics.service, ../events.types, ./domain-event.consumer, @nestjs/common | - |
| backend/src/providers/events/consumers/domain-event.consumer.ts | ../events.service, ../events.types, @nestjs/common, rxjs/operators | - |
| backend/src/providers/events/consumers/events-consumer.module.ts | ../../../modules/analytics/analytics.module, ../../../modules/health-score/health-score.module, ../../../modules/notifications/notifications.module, ../events.module, ./analytics-event.handler, ./domain-event.consumer, ./healthscore-event.handler, ./notification-event.handler, @nestjs/common | - |
| backend/src/providers/events/consumers/healthscore-event.handler.ts | ../events.types, ./domain-event.consumer, @nestjs/common | - |
| backend/src/providers/events/consumers/notification-event.handler.ts | ../../../modules/notifications/notifications.service, ../events.types, ./domain-event.consumer, @nestjs/common | - |
| backend/src/providers/events/events.module.ts | ./events.service, @nestjs/common | - |
| backend/src/providers/events/events.service.ts | @nestjs/common, rxjs | - |
| backend/src/providers/gemini/gemini.module.ts | ./gemini.service, @nestjs/common | - |
| backend/src/providers/gemini/gemini.service.ts | ../ai/ai-orchestrator.service, @nestjs/common | - |
| backend/src/providers/jobs/job-queue.service.ts | ../events/events.service, ../events/events.types, ../prisma/prisma.service, @nestjs/common | - |
| backend/src/providers/jobs/jobs.module.ts | ../prisma/prisma.module, ./job-queue.service, ./jobs.service, @nestjs/common | - |
| backend/src/providers/jobs/jobs.service.ts | ../prisma/prisma.service, @nestjs/common | - |
| backend/src/providers/livekit/livekit.module.ts | ./livekit.service, @nestjs/common | - |
| backend/src/providers/livekit/livekit.service.ts | @nestjs/common, livekit-server-sdk | - |
| backend/src/providers/observability/observability.module.ts | ./observability.service, @nestjs/common | - |
| backend/src/providers/observability/observability.service.ts | @nestjs/common | - |
| backend/src/providers/prisma/prisma.module.ts | ./prisma.service, @nestjs/common | - |
| backend/src/providers/prisma/prisma.service.ts | @nestjs/common, @prisma/client | - |
| backend/src/providers/rabbitmq/rabbitmq.module.ts | @golevelup/nestjs-rabbitmq, @nestjs/common | - |
| backend/src/providers/razorpay/razorpay.module.ts | ./razorpay.service, @nestjs/common | - |
| backend/src/providers/razorpay/razorpay.service.ts | @nestjs/common, node:crypto, razorpay | - |
| backend/src/providers/redis/redis.module.ts | ./redis.service, @nestjs/common | - |
| backend/src/providers/redis/redis.service.ts | @nestjs/common, ioredis | - |
| backend/src/providers/storage/storage.module.ts | ./storage.service, @nestjs/common | - |
| backend/src/providers/storage/storage.service.ts | @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @nestjs/common, node:child_process, node:crypto, node:fs/promises, node:os, node:path, node:util | - |
| backend/src/test/auth.service.spec.ts | ../common/services/audit-log.service, ../common/services/wysh-id.service, ../modules/auth/auth.service, ../modules/auth/sms.service, ../providers/prisma/prisma.service, ./helpers, @nestjs/common, @nestjs/jwt, @nestjs/testing, node:assert/strict, node:test | - |
| backend/src/test/authorization.spec.ts | ../common/encryption/encryption.service, ../common/guards/jwt-auth.guard, ../common/guards/roles.guard, ../common/services/audit-log.service, ../modules/vault/vault.service, ../providers/prisma/prisma.service, ../providers/storage/storage.service, ./helpers, @nestjs/common, @nestjs/core, @nestjs/jwt, @nestjs/testing, node:assert/strict, node:test | - |
| backend/src/test/consent.service.spec.ts | ../common/services/audit-log.service, ../modules/consent/consent.service, ../providers/prisma/prisma.service, ./helpers, @nestjs/common, @nestjs/testing, node:assert/strict, node:test | - |
| backend/src/test/e2e/appointment.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/auth.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/clinic-admin.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/clinic-billing.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/clinic-queue.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/clinical-twin.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/health-graph.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/insurance.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/minimal-test.ts | @nestjs/common, @nestjs/testing | - |
| backend/src/test/e2e/misc.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/pharmacy.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/prescription.e2e-spec.ts | ./setup, node:assert/strict, node:test | - |
| backend/src/test/e2e/setup.ts | ../../app.module, ../../common/filters/http-exception.filter, ../../common/interceptors/api-envelope.interceptor, ../../common/middleware/request-id.middleware, ../../providers/ai/ai-provider.module, ../../providers/gemini/gemini.service, ../../providers/livekit/livekit.service, ../../providers/prisma/prisma.service, ../../providers/razorpay/razorpay.service, ../../providers/redis/redis.service, ../../providers/storage/storage.service, @nestjs/common, @nestjs/jwt, @nestjs/testing, @nestjs/throttler, node:crypto, supertest | - |
| backend/src/test/e2e/workflows.e2e-spec.ts | ../../common/filters/http-exception.filter, ../../common/guards/jwt-auth.guard, ../../common/guards/roles.guard, ../../common/interceptors/api-envelope.interceptor, ../../common/middleware/request-id.middleware, ../../common/services/audit-log.service, ../../modules/analytics/analytics.controller, ../../modules/analytics/analytics.service, ../../modules/emergency/emergency.controller, ../../modules/emergency/emergency.service, ../../modules/health-score/health-score.controller, ../../modules/health-score/health-score.service, ../../providers/ai/ai-provider.module, ../../providers/events/events.module, ../../providers/events/events.service, ../../providers/prisma/prisma.module, ../../providers/prisma/prisma.service, ../../providers/redis/redis.service, @nestjs/common, @nestjs/core, @nestjs/jwt, @nestjs/testing, @prisma/client, node:assert/strict, node:crypto, node:test, supertest | - |
| backend/src/test/helpers.ts | node:test | - |
| backend/src/test/vault.service.spec.ts | ../common/encryption/encryption.service, ../common/services/audit-log.service, ../modules/vault/vault.service, ../providers/prisma/prisma.service, ../providers/storage/storage.service, ./helpers, @nestjs/testing, node:assert/strict, node:test | - |
| backend/tests/ai.smoke.test.js | ../db.js | - |
| backend/tests/auth.contract.test.mjs | node:assert/strict | - |
| backend/tests/db.smoke.test.js | ../db.js | - |
| backend/tests/patients.columns.test.js | ../db.js | - |
| backend/tests/rbac.access-matrix.test.mjs | ../../shared/auth-contract.js, node:assert/strict | - |
| backend/tests/rls.patient-isolation.test.js | ../db/prismaFactory.js | - |
| backend/tests/rls.test.js | @jest/globals, @prisma/client | - |
| backend/tests/schema.contract.test.js | ../db.js | - |
| backend/tests/testEncounter.js | ../db.js | - |
| backend/tests/testInsert.js | ../db.js | - |
| backend/tests/testVitals.js | ../db.js | - |
| frontend/eslint.config.mjs | @eslint/js, @next/eslint-plugin-next, eslint-plugin-react, eslint-plugin-react-hooks, typescript-eslint | - |
| frontend/fix-unused-imports.mjs | eslint, fs | - |
| frontend/fix-unused-v2.mjs | fs, path | - |
| frontend/fix-unused-v3.mjs | fs | - |
| frontend/next.config.ts | path | - |
| frontend/src/app/(auth)/forgot-password/page.tsx | @/components/ui/button, @/components/ui/input, @/lib/utils, framer-motion, lucide-react, next/link, next/navigation, react | - |
| frontend/src/app/(auth)/layout.tsx | lucide-react | - |
| frontend/src/app/(auth)/login/page.tsx | @/components/ui/button, @/components/ui/input, @/lib/utils, framer-motion, lucide-react, next/link, next/navigation, react | - |
| frontend/src/app/(auth)/otp/page.tsx | @/components/ui/button, @/lib/api, @/lib/utils, framer-motion, lucide-react, next/link, next/navigation, react | - |
| frontend/src/app/(auth)/reset-password/page.tsx | @/components/ui/button, @/components/ui/input, @/lib/utils, framer-motion, lucide-react, next/link, next/navigation, react | - |
| frontend/src/app/(auth)/signup/page.tsx | @/components/ui/button, @/components/ui/input, @/lib/utils, framer-motion, lucide-react, next/link, next/navigation, react | - |
| frontend/src/app/(platform)/app/ai-insights/page.tsx | @/components/ui/skeleton, @/lib/utils, react | - |
| frontend/src/app/(platform)/app/ai-navigator/page.tsx | framer-motion, react | - |
| frontend/src/app/(platform)/app/consent/page.tsx | @/lib/api, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/(platform)/app/diagnostics/page.tsx | @/lib/api, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/(platform)/app/discovery/page.tsx | @/lib/api, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/(platform)/app/emergency/page.tsx | @/components/ui/skeleton, @/hooks/use-emergency, @/hooks/use-health-data, @/stores/session-store, framer-motion, react | - |
| frontend/src/app/(platform)/app/family/page.tsx | @/lib/api, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/(platform)/app/health-graph/page.tsx | framer-motion, react | - |
| frontend/src/app/(platform)/app/insurance/page.tsx | @/lib/api-client, @tanstack/react-query, date-fns, framer-motion, react | - |
| frontend/src/app/(platform)/app/layout.tsx | @/components/app/platform-shell | - |
| frontend/src/app/(platform)/app/page.tsx | @/hooks/use-health-data, @tanstack/react-query, framer-motion, react | - |
| frontend/src/app/(platform)/app/pharmacy/page.tsx | @/lib/api, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/(platform)/app/prescriptions/page.tsx | date-fns, framer-motion, react | - |
| frontend/src/app/(platform)/app/records/page.tsx | @/lib/api, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/(platform)/app/subscriptions/page.tsx | date-fns, framer-motion, lucide-react, react | - |
| frontend/src/app/(platform)/app/telemedicine/page.tsx | @tanstack/react-query, react | - |
| frontend/src/app/(platform)/app/timeline/page.tsx | @/components/ui/skeleton, @/hooks/use-health-data, @/lib/api-client, @/lib/utils, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/(platform)/app/wallet/page.tsx | date-fns, framer-motion, react | - |
| frontend/src/app/(platform)/health-twin/family-history/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/card, @/components/ui/page-header, @/components/ui/skeleton, @/lib/api-client, @tanstack/react-query, framer-motion, react | - |
| frontend/src/app/(platform)/health-twin/lifestyle/page.tsx | @/components/ui/button, @/components/ui/card, @/components/ui/page-header, @/components/ui/skeleton, @/lib/api-client, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/(platform)/health-twin/prevention/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/card, @/components/ui/page-header, @/components/ui/progress, @/components/ui/skeleton, @/lib/api-client, @tanstack/react-query, framer-motion | - |
| frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/card, @/components/ui/page-header, @/components/ui/progress, @/components/ui/skeleton, @/lib/api-client, @tanstack/react-query, framer-motion | - |
| frontend/src/app/(platform)/wysh/layout.tsx | @/components/app/platform-shell | - |
| frontend/src/app/(platform)/wysh/page.tsx | @tanstack/react-query, date-fns | - |
| frontend/src/app/admin/abdm/page.tsx | @/components/ui/badge, @/components/ui/card, @/components/ui/page-header, @/components/ui/skeleton, @tanstack/react-query, framer-motion, lucide-react, recharts | - |
| frontend/src/app/admin/analytics/page.tsx | @/components/ui/card, @/components/ui/page-header, @/components/ui/skeleton, framer-motion, lucide-react, react | - |
| frontend/src/app/admin/ehr/cds/page.tsx | framer-motion, react | - |
| frontend/src/app/admin/ehr/encounters/page.tsx | @/components/ui/button, @/components/ui/card, @/components/ui/input, @/components/ui/page-header, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/admin/ehr/notes/page.tsx | @/components/ui/button, @/components/ui/card, @/components/ui/input, @/components/ui/page-header, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/admin/ehr/orders/page.tsx | @/components/ui/button, @/components/ui/card, @/components/ui/input, @/components/ui/page-header, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/admin/ehr/page.tsx | @/components/ui/card, @/components/ui/page-header, @/components/ui/skeleton, @/components/ui/stat-card, @tanstack/react-query, framer-motion, lucide-react, next/link | - |
| frontend/src/app/admin/ehr/patients/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/card, @/components/ui/page-header, @tanstack/react-query, framer-motion, lucide-react, react | - |
| frontend/src/app/admin/layout.tsx | @/components/app/role-shell | - |
| frontend/src/app/admin/nhcx/page.tsx | @/components/ui/badge, @/components/ui/card, @tanstack/react-query, framer-motion, recharts | - |
| frontend/src/app/admin/page.tsx | @/components/ui/card, framer-motion, react, recharts | - |
| frontend/src/app/admin/population-health/page.tsx | @/components/ui/card, @/components/ui/page-header, @/components/ui/skeleton, @/components/ui/stat-card, @tanstack/react-query, framer-motion, lucide-react, recharts | - |
| frontend/src/app/admin/provider-graph/page.tsx | @/components/ui/card, @/components/ui/page-header, @tanstack/react-query, framer-motion, recharts | - |
| frontend/src/app/admin/risk-analytics/page.tsx | @/components/ui/card, @/components/ui/page-header, @/components/ui/skeleton, @/components/ui/stat-card, @tanstack/react-query, framer-motion, lucide-react, recharts | - |
| frontend/src/app/admin/subscriptions/page.tsx | @/components/ui/badge, @/components/ui/card, @/components/ui/page-header, @/components/ui/skeleton, @/components/ui/status-badge, framer-motion, lucide-react, react | - |
| frontend/src/app/admin/users/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/page-header, @/components/ui/skeleton, @/components/ui/status-badge, framer-motion, lucide-react, react | - |
| frontend/src/app/clinic/admin/page.tsx | react | - |
| frontend/src/app/clinic/billing/page.tsx | framer-motion, react | - |
| frontend/src/app/clinic/branding/page.tsx | @/lib/utils, lucide-react, react | - |
| frontend/src/app/clinic/clinical-twin/page.tsx | react | - |
| frontend/src/app/clinic/layout.tsx | @/components/app/role-shell | - |
| frontend/src/app/clinic/page.tsx | next/link, react | - |
| frontend/src/app/clinic/reception/page.tsx | framer-motion, react | - |
| frontend/src/app/design/page.tsx | framer-motion, react | - |
| frontend/src/app/doctor/billing/page.tsx | @/lib/utils, lucide-react, react | - |
| frontend/src/app/doctor/emr/[specialty]/page.tsx | @/lib/utils, @/stores/patient-store, next/navigation, react | - |
| frontend/src/app/doctor/emr/cardiology/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/dental/page.tsx | @/components/specialties/dental/radiography-panel, @/components/specialties/dental/tooth-chart-panel, @/components/specialties/dental/treatment-plan-panel, @/lib/specialty-api, @/lib/utils, @/stores/dental-workspace-store, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/dermatology/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/endocrinology/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/ent/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/gastroenterology/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/general-medicine/page.tsx | @/data/mock-patients, @/lib/specialty-api, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/gynecology/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/neurology/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/ophthalmology/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/orthopedics/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/page.tsx | @/lib/utils, @/stores/session-store, next/link | - |
| frontend/src/app/doctor/emr/pediatrics/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/psychiatry/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/pulmonology/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/emr/urology/page.tsx | @/features/specialties/components/specialty-form-renderer, @/lib/specialty-api, @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/app/doctor/layout.tsx | @/components/app/doctor-workspace-layout | - |
| frontend/src/app/doctor/loading.tsx | @/components/ui/skeleton | - |
| frontend/src/app/doctor/messages/page.tsx | @/lib/utils, lucide-react, react | - |
| frontend/src/app/doctor/page.tsx | @/data/mock-patients, @/lib/utils, @/stores/patient-store, lucide-react, next/link, react | - |
| frontend/src/app/doctor/patients/page.tsx | @/components/ui/avatar, @/components/ui/badge, @/components/ui/button, @/components/ui/card, framer-motion, lucide-react, react | - |
| frontend/src/app/doctor/prescriptions/page.tsx | @/components/ui/button, @/components/ui/card, @/components/ui/status-badge, framer-motion, react | - |
| frontend/src/app/doctor/schedule/page.tsx | @/components/ui/card, @/lib/utils, framer-motion, react | - |
| frontend/src/app/doctor/telemedicine/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/card, framer-motion, react | - |
| frontend/src/app/insurance/claims/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/input, @/components/ui/skeleton, framer-motion, react | - |
| frontend/src/app/insurance/copilot/page.tsx | @/components/ui/card, @/lib/utils, framer-motion, react | - |
| frontend/src/app/insurance/coverage-rules/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/input, @/components/ui/skeleton, @/components/ui/status-badge, framer-motion, lucide-react, react | - |
| frontend/src/app/insurance/eligibility/page.tsx | @/components/ui/button, @/components/ui/card, @/lib/utils, framer-motion, react | - |
| frontend/src/app/insurance/layout.tsx | @/components/app/role-shell | - |
| frontend/src/app/insurance/page.tsx | @/components/ui/card, framer-motion, next/link, react, recharts | - |
| frontend/src/app/insurance/plans/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/input, @/components/ui/skeleton, @/components/ui/status-badge, framer-motion, lucide-react, react | - |
| frontend/src/app/insurance/pre-auth/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/input, @/components/ui/skeleton, @/components/ui/status-badge, framer-motion, lucide-react, react | - |
| frontend/src/app/insurance/providers/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/card, @/components/ui/input, @/components/ui/skeleton, framer-motion, lucide-react, react | - |
| frontend/src/app/insurance/settlements/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/input, @/components/ui/skeleton, @/components/ui/status-badge, framer-motion, lucide-react, react | - |
| frontend/src/app/layout.tsx | @/providers/app-provider | - |
| frontend/src/app/os/admin/page.tsx | framer-motion | - |
| frontend/src/app/os/billing/page.tsx | framer-motion, react | - |
| frontend/src/app/os/dashboard/page.tsx | @/components/ui/button, @/stores/session-store, framer-motion | - |
| frontend/src/app/os/doctor/page.tsx | @/lib/api-client, @/lib/utils, @/stores/session-store, @tanstack/react-query, react | - |
| frontend/src/app/os/insurance/page.tsx | framer-motion, react | - |
| frontend/src/app/os/lab/page.tsx | @/components/ui/card, @/components/ui/page-header, framer-motion, react | - |
| frontend/src/app/os/layout.tsx | @/lib/api, @/lib/utils, @/stores/session-store, lucide-react, next/navigation, react | - |
| frontend/src/app/os/nurse/page.tsx | framer-motion, react | - |
| frontend/src/app/os/page.tsx | @/lib/api, @/stores/session-store, lucide-react, next/navigation, react | - |
| frontend/src/app/os/pharmacy/page.tsx | framer-motion, react | - |
| frontend/src/app/os/reception/page.tsx | @/components/ui/badge, @/components/ui/button, @/components/ui/card, framer-motion, react | - |
| frontend/src/app/page.tsx | @/components/marketing/ai-intelligence, @/components/marketing/doctor-experience, @/components/marketing/emergency-readiness, @/components/marketing/final-cta, @/components/marketing/footer, @/components/marketing/future-section, @/components/marketing/health-timeline, @/components/marketing/health-twin-demo, @/components/marketing/hero, @/components/marketing/how-it-works, @/components/marketing/os-dashboard-preview, @/components/marketing/problem-section, @/components/marketing/product-ecosystem, @/components/marketing/social-proof, @/components/marketing/trust-strip | - |
| frontend/src/components/app/ai-copilot-sidebar.tsx | @/lib/utils, @/stores/patient-store, lucide-react, react | - |
| frontend/src/components/app/doctor-workspace-layout.tsx | @/components/app/notification-bell, @/components/ui/avatar, next/link, next/navigation, react | - |
| frontend/src/components/app/health-twin.tsx | framer-motion, react | - |
| frontend/src/components/app/mobile-nav.tsx | @/lib/utils, lucide-react, next/link, next/navigation | - |
| frontend/src/components/app/notification-bell.tsx | @/components/ui/button, @/lib/utils, lucide-react, react | - |
| frontend/src/components/app/patient-header.tsx | @/lib/utils, @/stores/patient-store, lucide-react | - |
| frontend/src/components/app/patient-queue.tsx | @/data/mock-patients, @/lib/utils, @/stores/patient-store, lucide-react, next/navigation, react | - |
| frontend/src/components/app/platform-shell.tsx | @/lib/api, @/lib/utils, framer-motion, next/link, next/navigation, react | - |
| frontend/src/components/app/role-shell.tsx | @/components/app/notification-bell, @/components/ui/avatar, @/components/ui/separator, @/lib/utils, lucide-react, next/link, next/navigation, react | - |
| frontend/src/components/button.tsx | react | - |
| frontend/src/components/card.tsx | react | - |
| frontend/src/components/clinic/invoice-card.tsx | @/components/ui/card, @/components/ui/separator, @/components/ui/status-badge, @/lib/utils, lucide-react | - |
| frontend/src/components/clinic/queue-board.tsx | @/components/ui/avatar, @/components/ui/badge, @/components/ui/card, @/components/ui/status-badge, @/lib/utils, lucide-react | - |
| frontend/src/components/clinic/revenue-chart.tsx | @/components/ui/card, @/lib/utils, react | - |
| frontend/src/components/dashboard/appointments-widget.tsx | @/components/dashboard/dashboard-widget, @/components/ui/status-badge, lucide-react | - |
| frontend/src/components/dashboard/dashboard-widget.tsx | @/components/ui/skeleton, @/lib/utils, lucide-react | - |
| frontend/src/components/dashboard/family-alerts-widget.tsx | @/components/dashboard/dashboard-widget, @/lib/utils, lucide-react | - |
| frontend/src/components/dashboard/health-score-card.tsx | @/lib/utils | - |
| frontend/src/components/dashboard/insurance-status-widget.tsx | @/components/dashboard/dashboard-widget, @/components/ui/button, @/components/ui/progress, @/components/ui/status-badge, lucide-react | - |
| frontend/src/components/dashboard/prescriptions-widget.tsx | @/components/dashboard/dashboard-widget, @/components/ui/status-badge, lucide-react | - |
| frontend/src/components/dashboard/reports-widget.tsx | @/components/dashboard/dashboard-widget, @/components/ui/status-badge, lucide-react | - |
| frontend/src/components/insurance/analysis-panel.tsx | @/components/ui/card, @/components/ui/progress, @/lib/utils, lucide-react | - |
| frontend/src/components/insurance/claim-card.tsx | @/components/ui/card, @/components/ui/status-badge, @/lib/utils, lucide-react | - |
| frontend/src/components/insurance/claim-timeline.tsx | @/lib/utils, lucide-react | - |
| frontend/src/components/insurance/coverage-summary.tsx | @/components/ui/card, @/lib/utils | - |
| frontend/src/components/insurance/policy-card.tsx | @/components/ui/card, @/components/ui/separator, @/components/ui/status-badge, @/lib/utils, lucide-react | - |
| frontend/src/components/insurance/pre-auth-card.tsx | @/components/ui/card, @/components/ui/separator, @/components/ui/status-badge, @/lib/utils, lucide-react | - |
| frontend/src/components/marketing/ai-intelligence.tsx | framer-motion, react | - |
| frontend/src/components/marketing/doctor-experience.tsx | framer-motion, react | - |
| frontend/src/components/marketing/emergency-readiness.tsx | framer-motion, lucide-react, react | - |
| frontend/src/components/marketing/features-section.tsx | lucide-react | - |
| frontend/src/components/marketing/final-cta.tsx | @/components/ui/button, framer-motion, lucide-react, next/link | - |
| frontend/src/components/marketing/footer.tsx | lucide-react, next/link | - |
| frontend/src/components/marketing/future-section.tsx | framer-motion, lucide-react, react | - |
| frontend/src/components/marketing/health-timeline.tsx | framer-motion, lucide-react, react | - |
| frontend/src/components/marketing/health-twin-demo.tsx | framer-motion, lucide-react, react | - |
| frontend/src/components/marketing/hero.tsx | @/components/ui/badge, @/components/ui/button, framer-motion, lucide-react, next/link | - |
| frontend/src/components/marketing/how-it-works.tsx | framer-motion, react | - |
| frontend/src/components/marketing/os-dashboard-preview.tsx | framer-motion, next/navigation | - |
| frontend/src/components/marketing/problem-section.tsx | framer-motion, react | - |
| frontend/src/components/marketing/product-ecosystem.tsx | framer-motion, next/link | - |
| frontend/src/components/marketing/social-proof.tsx | framer-motion, lucide-react, react | - |
| frontend/src/components/marketing/trust-strip.tsx | lucide-react | - |
| frontend/src/components/skeleton.tsx | react | - |
| frontend/src/components/specialties/dental/billing-panel.tsx | @/lib/utils, @/stores/dental-workspace-store, lucide-react, react | - |
| frontend/src/components/specialties/dental/radiography-panel.tsx | @/lib/utils, lucide-react, react | - |
| frontend/src/components/specialties/dental/soap-panel.tsx | @/lib/utils, @/stores/dental-workspace-store, lucide-react, react | - |
| frontend/src/components/specialties/dental/tooth-chart-panel.tsx | @/lib/utils, @/stores/dental-workspace-store, lucide-react, react | - |
| frontend/src/components/specialties/dental/treatment-plan-panel.tsx | @/lib/utils, @/stores/dental-workspace-store, lucide-react, react | - |
| frontend/src/components/theme-toggle.tsx | @/lib/theme, lucide-react | - |
| frontend/src/components/timeline/ai-insight-card.tsx | framer-motion, lucide-react | - |
| frontend/src/components/timeline/event-card.tsx | ./types, @/lib/utils, date-fns, framer-motion, react | - |
| frontend/src/components/timeline/hero-section.tsx | @/lib/utils, lucide-react | - |
| frontend/src/components/timeline/insights-panel.tsx | @/lib/utils, lucide-react | - |
| frontend/src/components/timeline/left-rail.tsx | @/lib/utils | - |
| frontend/src/components/timeline/milestone-card.tsx | ./types, date-fns, framer-motion, lucide-react | - |
| frontend/src/components/timeline/search-bar.tsx | lucide-react | - |
| frontend/src/components/ui/avatar.tsx | @/lib/utils, @radix-ui/react-avatar, react | - |
| frontend/src/components/ui/badge.tsx | @/lib/utils | - |
| frontend/src/components/ui/button.tsx | @/lib/utils | - |
| frontend/src/components/ui/card.tsx | @/lib/utils | - |
| frontend/src/components/ui/data-table.tsx | @/lib/utils, lucide-react, react | - |
| frontend/src/components/ui/dialog.tsx | @/lib/utils, @radix-ui/react-dialog, lucide-react, react | - |
| frontend/src/components/ui/dropdown-menu.tsx | @/lib/utils, @radix-ui/react-dropdown-menu, lucide-react, react | - |
| frontend/src/components/ui/empty-state.tsx | @/components/ui/button, @/lib/utils | - |
| frontend/src/components/ui/glass-card.tsx | @/lib/utils | - |
| frontend/src/components/ui/input.tsx | @/lib/utils | - |
| frontend/src/components/ui/page-header.tsx | @/lib/utils | - |
| frontend/src/components/ui/progress.tsx | @/lib/utils, @radix-ui/react-progress, react | - |
| frontend/src/components/ui/search-input.tsx | @/lib/utils, lucide-react, react | - |
| frontend/src/components/ui/select.tsx | @/lib/utils, @radix-ui/react-select, lucide-react, react | - |
| frontend/src/components/ui/separator.tsx | @/lib/utils, @radix-ui/react-separator, react | - |
| frontend/src/components/ui/skeleton.tsx | @/lib/utils, lucide-react, react | - |
| frontend/src/components/ui/stat-card.tsx | @/lib/utils, lucide-react | - |
| frontend/src/components/ui/status-badge.tsx | @/components/ui/badge | - |
| frontend/src/components/ui/table.tsx | @/lib/utils, react | - |
| frontend/src/components/ui/tabs.tsx | @/lib/utils, @radix-ui/react-tabs, react | - |
| frontend/src/components/ui/toast.tsx | @/lib/utils, @radix-ui/react-toast, class-variance-authority, lucide-react, react, zustand | - |
| frontend/src/components/ui/tooltip.tsx | @/lib/utils, @radix-ui/react-tooltip, react | - |
| frontend/src/features/auth/login-form.tsx | @/components/ui/button, @/components/ui/card, @/components/ui/input, @/lib/api, @/stores/session-store, next/navigation, react | - |
| frontend/src/features/general-medicine/components/ai-clinical-assistant.tsx | ../types, @/lib/utils, lucide-react, react | - |
| frontend/src/features/general-medicine/components/clinical-snapshot.tsx | ../types, @/lib/utils, lucide-react, react | - |
| frontend/src/features/general-medicine/components/diagnosis-tools.tsx | ../types, @/lib/utils, lucide-react, react | - |
| frontend/src/features/general-medicine/components/patient-context-header.tsx | ../types, @/lib/utils, lucide-react | - |
| frontend/src/features/general-medicine/components/report-generator.tsx | ../types, @/lib/utils, lucide-react, react | - |
| frontend/src/features/general-medicine/components/rx-prescription.tsx | ../types, @/lib/utils, lucide-react, react | - |
| frontend/src/features/general-medicine/components/soap-workspace.tsx | ../types, @/lib/utils, lucide-react, react | - |
| frontend/src/features/specialties/components/specialty-form-renderer.tsx | @/lib/utils, react | - |
| frontend/src/hooks/use-emergency.ts | @/lib/api-client, @tanstack/react-query | - |
| frontend/src/hooks/use-health-data.ts | @/lib/api-client, @tanstack/react-query | - |
| frontend/src/hooks/use-queries.ts | @/lib/api-client, @tanstack/react-query | - |
| frontend/src/hooks/use-telemedicine.ts | @/lib/api-client, @tanstack/react-query | - |
| frontend/src/lib/api-client.ts | ./api | - |
| frontend/src/lib/api.ts | ./api-mock, @/stores/session-store | - |
| frontend/src/lib/specialty-api.ts | ./api | - |
| frontend/src/lib/theme.ts | react | - |
| frontend/src/lib/utils.ts | clsx, tailwind-merge | - |
| frontend/src/middleware.ts | next/server | - |
| frontend/src/providers/app-provider.tsx | @/components/ui/toast, @tanstack/react-query, react | - |
| frontend/src/stores/dental-workspace-store.ts | zustand | - |
| frontend/src/stores/patient-store.ts | zustand | - |
| frontend/src/stores/session-store.ts | zustand, zustand/middleware | - |
| k6/scenarios/claims-submission.js | k6, k6/http | - |
| k6/scenarios/consultations.js | k6, k6/data, k6/http | - |
| k6/scenarios/dashboard-load.js | k6, k6/data, k6/http | - |
| k6/scenarios/smoke.js | k6, k6/http | - |
| scripts/validate-deployment.mjs | node:fs, node:path, node:url | - |
| scripts/validate-integrity.ts | @prisma/client | - |
| scripts/validate-security.mjs | node:fs, node:path, node:url | - |
| shared/eslint.config.mjs | @eslint/js, typescript-eslint | - |
| shared/src/contracts/api.ts | ../schemas/domain, zod | - |
| shared/src/schemas/domain.ts | ../constants/roles, zod | - |
