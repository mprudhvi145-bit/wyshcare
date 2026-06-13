/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/app.module.ts
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * NestJS module: wires providers, controllers, and imports for src
 *
 * Responsibilities:
 * - Configure dependency injection for src
 * - Register controllers, services, and providers
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - graphql
 - config
 - throttler
 - apollo
 - common
 *
 * Dependencies:
 - graphql
 - config
 - throttler
 - apollo
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
WyshID
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import depthLimit from 'graphql-depth-limit';

import { EncryptionModule } from './common/encryption/encryption.module';
import { AuthModule } from './modules/auth/auth.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ConsentModule } from './modules/consent/consent.module';
import { VaultModule } from './modules/vault/vault.module';
import { AiModule } from './modules/ai/ai.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { TelemedicineModule } from './modules/telemedicine/telemedicine.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module';
import { AdminModule } from './modules/admin/admin.module';
import { DeviceTokensModule } from './modules/device-tokens/device-tokens.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { InteroperabilityModule } from './modules/interoperability/interoperability.module';
import { FamilyModule } from './modules/family/family.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EhrModule } from './modules/ehr/ehr.module';
import { HealthGraphV2Module } from './modules/health-graph-v2/health-graph-v2.module';
import { DigitalTwinModule } from './modules/digital-twin/digital-twin.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { HealthTwinModule } from './modules/health-twin/health-twin.module';
import { WyshModule } from './modules/wysh/wysh.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { CarePlansModule } from './modules/care-plans/care-plans.module';
import { AbdmModule } from './modules/abdm/abdm.module';
import { NHCXModule } from './modules/nhcx/nhcx.module';
import { ProviderGraphModule } from './modules/provider-graph/provider-graph.module';
import { SearchModule } from './modules/search/search.module';
import { StaffModule } from './modules/staff/staff.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { ClinicAdminModule } from './modules/clinic-admin/admin-os.module';
import { ClinicBillingModule } from './modules/clinic-billing/billing.module';
import { ClinicReceptionModule } from './modules/clinic-reception/reception.module';
import { ClinicalTwinModule } from './modules/clinical-twin/clinical-twin.module';
import { HealthGraphModule } from './modules/health-graph/health-graph.module';
import { QueueMonitorModule } from './modules/queue-monitor/queue-monitor.module';
import { GoalsModule } from './modules/goals/goals.module';
import { HealthScoreModule } from './modules/health-score/health-score.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { AIRiskModule } from './modules/ai-risk/ai-risk.module';
import { AiLifestyleModule } from './modules/ai-lifestyle/ai-lifestyle.module';
import { AiPreventiveModule } from './modules/ai-preventive/ai-preventive.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { ClinicBrandingModule } from './modules/clinic-branding/clinic-branding.module';
import { FhirModule } from './modules/fhir/fhir.module';
import { EventsConsumerModule } from './providers/events/consumers/events-consumer.module';
import { RabbitMQModule } from './providers/rabbitmq/rabbitmq.module';
import { PrismaModule } from './providers/prisma/prisma.module';
import { RedisModule } from './providers/redis/redis.module';
import { StorageModule } from './providers/storage/storage.module';
import { EventsModule } from './providers/events/events.module';
import { ObservabilityModule } from './providers/observability/observability.module';
import { LivekitModule } from './providers/livekit/livekit.module';
import { RazorpayModule } from './providers/razorpay/razorpay.module';
import { GeminiModule } from './providers/gemini/gemini.module';
import { AiProviderModule } from './providers/ai/ai-provider.module';
import { AiOrchestratorModule } from './providers/ai/ai-orchestrator.module';
import { JobsModule } from './providers/jobs/jobs.module';
import { SupabaseModule } from './providers/supabase/supabase.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AuditLogService } from './common/services/audit-log.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  controllers: [],
  providers: [AuditLogService, JwtAuthGuard, RolesGuard],
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                autoSchemaFile: true,
                sortSchema: true,
                playground: config.get('NODE_ENV') !== 'production',
                introspection: config.get('NODE_ENV') !== 'production',
                validationRules: [depthLimit(10)],
                csrfPrevention: true,
            }),
        }),
        PrismaModule,
        EncryptionModule,
        RedisModule,
        StorageModule,
        EventsModule,
        EventsConsumerModule,
        RabbitMQModule.forRoot(),
        ObservabilityModule,
        LivekitModule,
        RazorpayModule,
        GeminiModule,
        AiProviderModule,
        AiOrchestratorModule,
        SupabaseModule,
        JobsModule,
        HealthModule,
        MetricsModule,
        AuthModule,
        IdentityModule,
        ConsentModule,
        VaultModule,
        AiModule,
        DoctorsModule,
        DiscoveryModule,
        TelemedicineModule,
        PaymentsModule,
        PharmacyModule,
        DiagnosticsModule,
        AdminModule,
        DeviceTokensModule,
        NotificationsModule,
        TimelineModule,
        InteroperabilityModule,
        FamilyModule,
        DashboardModule,
        EhrModule,
        HealthGraphV2Module,
        DigitalTwinModule,
        PrescriptionModule,
        HealthTwinModule,
        WyshModule,
        InsuranceModule,
        CarePlansModule,
        AbdmModule,
        NHCXModule,
        ProviderGraphModule,
        SearchModule,
        StaffModule,
        WorkspaceModule,
        ClinicAdminModule,
        ClinicBillingModule,
        ClinicReceptionModule,
        ClinicalTwinModule,
        HealthGraphModule,
        QueueMonitorModule,
        GoalsModule,
        HealthScoreModule,
        EmergencyModule,
        AIRiskModule,
        AiLifestyleModule,
        AiPreventiveModule,
        AnalyticsModule,
        SpecialtiesModule,
        ClinicBrandingModule,
        FhirModule,
    ],
})
export class AppModule {}
