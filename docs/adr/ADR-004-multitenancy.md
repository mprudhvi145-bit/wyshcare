# ADR-004: Shared-Schema Multitenancy with Row Level Security

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** Vimarshak Prudhvi  
**Tags:** multitenancy, rls, security, architecture

---

## Context

WyshCare serves multiple organization types:
- Clinics and hospitals managing their own patient rosters
- Pharmacy partners with their own inventory and orders
- Diagnostic labs with test catalogs and results
- Insurance providers with policies and claims
- Individual patients using the platform directly

Each tenant's data must be isolated while sharing the same application infrastructure.

## Decision Drivers

- **Data isolation:** Robust separation between tenants (Clinic A cannot see Clinic B's patients)
- **Operational simplicity:** Single database = simpler backups, migrations, monitoring
- **Cross-tenant workflows:** Referrals, consent-based sharing, emergency access — these require controlled cross-tenant data access
- **Cost efficiency:** Separate databases per tenant would multiply operational costs for a small team
- **Schema evolution:** Single schema means migrations affect all tenants uniformly

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Shared schema + RLS** | Single database; cross-tenant workflows possible; simple migrations; cost-effective | Row-level; no tenant-level resource isolation; query performance affected by tenant data volume |
| **Schema-per-tenant** | Strong isolation; easy backup/restore per tenant | Cross-tenant queries impossible; migration must run N times; connection pooling complex; N+1 database problem |
| **Separate databases** | Strongest isolation; independent scaling | Maximum operational overhead; no cross-tenant features; cost prohibitive for small tenants |
| **Hybrid (shared + isolated for enterprise)** | Best of both worlds | Architectural complexity; routing logic; needs tenant classification |

## Decision

**Use shared-schema multitenancy** enforced exclusively through PostgreSQL Row Level Security (RLS).

### Model

```
┌─────────────────────────────────────────────────────────┐
│                 Shared PostgreSQL Database                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │  Tenant-Isolated Tables    │  Non-Tenant Tables  │     │
│  │  (with tenantId column)    │  (system-level)     │     │
│  ├────────────────────────────┼─────────────────────┤     │
│  │  Clinic          tenantId │  User               │     │
│  │  DoctorProfile   tenantId │  UserRole           │     │
│  │  Appointment     tenantId │  ConsentGrant       │     │
│  │  Prescription    tenantId │  AuditLog           │     │
│  │  BillingInvoice  tenantId │  Notification       │     │
│  │  PharmacyOrder   tenantId │  AIMemoryNode       │     │
│  │  ...                     │  ...                │     │
│  └────────────────────────────┴─────────────────────┘     │
│                                                           │
│  RLS Policy: WHERE tenant_id = current_setting('tenant')  │
│  RLS Policy: WHERE user_id = auth.uid()                   │
└─────────────────────────────────────────────────────────┘
```

### Tenant Identification

- `tenantId` column (nullable `String`) on all tenant-scoped models
- `Clinic`, `DoctorProfile`, `Appointment`, `Prescription`, `BillingInvoice`, `PharmacyPartner`, `PharmacyOrder`, `ConsultationSession`, and others carry `tenantId`
- The `User` model also has a `tenantId` field for direct user-to-tenant mapping
- For clinic workflows, `StaffAssignment` maps users to clinics with specific roles
- For consumer (patient) flows, `userId`-based RLS provides isolation without requiring a tenant

### RLS Enforcement Strategy

Three layers of access control work together:

1. **User-level isolation:** `userId` = `auth.uid()` — patients see only their own data
2. **Tenant-level isolation:** `tenantId` = `current_setting('app.tenant_id')` — clinic staff see only their clinic's data
3. **Role-based access:** `role` extracted from JWT — `SUPER_ADMIN` can bypass tenant isolation

### Key RLS Patterns

```sql
-- Patient access pattern
CREATE POLICY patient_own_data ON health_records
  FOR ALL USING (patient_user_id = auth.uid());

-- Clinic staff access pattern
CREATE POLICY clinic_staff_access ON appointments
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id')::text
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "UserRole".user_id = auth.uid()
      AND "UserRole".role IN ('DOCTOR', 'NURSE', 'CLINIC_MANAGER')
    )
  );

-- Cross-tenant access (consent-based)
CREATE POLICY consent_based_access ON health_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "ConsentGrant"
      WHERE "ConsentGrant".owner_user_id = health_records.patient_user_id
      AND "ConsentGrant".granted_to_user_id = auth.uid()
      AND "ConsentGrant".status = 'ACTIVE'
    )
  );
```

### Organization-Based Isolation

- Clinics are the primary tenant unit
- `DoctorClinic` mapping allows doctors to work across multiple clinics
- `StaffAssignment` enables non-doctor staff (reception, billing) per clinic
- Pharmacy partners and diagnostic labs are separate tenant types but share the same `tenantId` mechanism
- The `ProviderGraph` model handles provider network relationships across tenants

### Data Access Audit

All access to tenant data is logged through:
- `AuditLog` with `actorUserId`, `patientUserId`, `resourceType`, `resourceId`, `action`, `ipAddress`
- `AbdmAuditLog` for ABDM-specific health data access
- `ConsentGrant` audit trail tracks all consent-based access

## Consequences

**Positive:**
- Single database simplifies operations (backups, point-in-time recovery, monitoring)
- Cross-tenant workflows (referrals, consent grants, emergency access) work naturally
- Schema changes are instant and consistent across all tenants
- RLS provides defense-in-depth — even compromised API credentials cannot access other tenants' data
- Low cost — no per-tenant infrastructure

**Negative:**
- Noisy neighbor problem — one tenant's heavy query volume can impact others
- Hard limit: single PostgreSQL instance size (though 16TB+ is sufficient for most growth phases)
- Soft deletes and audit logging add complexity to data purging per tenant
- RLS policies must be carefully written to avoid performance degradation

**Mitigations:**
- Query performance managed via indexes, connection pooling (PgBouncer), and read replicas
- Enterprise tenants requiring physical isolation can be migrated to separate instances via the hybrid model
- Regular `EXPLAIN ANALYZE` reviews of RLS policy performance
- Row-level security bypass is itself audited — `SUPER_ADMIN` access logged separately
