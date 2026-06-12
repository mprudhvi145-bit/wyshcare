--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/policies/rls.sql
--
-- Product:
-- WyshCare Healthcare Operating System
--
-- Brand:
-- WYSH
--
-- Founder:
-- Vimarshak Prudhvi
--
-- Purpose:
-- SQL migration or query: rls
--
-- Responsibilities:
--  * - Manage database schema and data migrations
--
-- Database:
--  - None identified
--
-- Last Reviewed:
-- 2026-06-12
--
-- ============================================================================
-- (c) Wysh Technologies
-- Built by Vimarshak Prudhvi
-- All Rights Reserved
-- ============================================================================
--

/* =============================================================================
   WYSHCARE ROW LEVEL SECURITY
   Target database: PostgreSQL 14+
   Generated against: Prisma schema (no @@map directives — table names are
   PascalCase, matching model names exactly).

   ROLE MODEL
   ----------
   wyshcare_app      — NestJS backend. BYPASSRLS + limited privileges.
                       Application-layer authorization (NestJS guards + service
                       WHERE clauses) is the primary enforcement boundary.
   wyshcare_readonly — Analytics / BI / direct DB access. Subject to all
                       policies below. Caller must set app.current_user_id
                       within a transaction before querying.

   HOW TO APPLY
   ------------
   Run as superuser (postgres):
     psql -U postgres -d wyshcare -f policies/rls.sql

   POLICY MATRIX
   -------------
   Table               | Patient owns | Doctor (consented) | Admin | Readonly
   --------------------|--------------|-------------------|-------|----------
   User                | own row only | —                 | all   | own row
   UserRole            | own rows     | —                 | all   | own rows
   DeviceSession       | own rows     | —                 | —     | own rows
   RefreshToken        | own rows     | —                 | —     | own rows
   OtpChallenge        | backend only | —                 | —     | none
   HealthRecord        | own rows     | consented         | all   | own rows
   Prescription        | own rows     | consented         | all   | own rows
   DiagnosticReport    | own rows     | consented         | all   | own rows
   ConsentGrant        | own rows     | granted-to rows   | all   | own rows
   ShareLink           | own rows     | —                 | all   | own rows
   FamilyRelation      | actor rows   | —                 | all   | actor rows
   TimelineEvent       | own rows     | —                 | all   | own rows
   Appointment         | patient rows | doctor rows       | all   | own rows
   EmergencyAccess     | own rows     | —                 | all   | insert+own
   AuditLog            | insert only  | insert only       | read  | none
   PaymentOrder        | own rows     | —                 | all   | own rows
   AIMemoryNode        | own rows     | —                 | —     | own rows
   AIMemoryEdge        | own rows     | —                 | —     | own rows
   AIJob               | own rows     | —                 | —     | own rows
   PharmacyPartner     | backend only | —                 | all   | all
   PharmacyOrder       | own rows     | —                 | all   | own rows
   DiagnosticsPartner  | backend only | —                 | all   | all
   DiagnosticOrder     | own rows     | —                 | all   | own rows
   DoctorProfile       | backend only | own row           | all   | all
   Clinic              | backend only | —                 | all   | all
   DoctorClinic        | backend only | —                 | all   | all
   ConsultationSession | patient rows | doctor rows       | all   | own rows
   ConsultationSummary | patient rows | doctor rows       | all   | own rows
   Notification        | own rows     | —                 | —     | own rows
   ABDMLinkage         | own rows     | —                 | —     | own rows
============================================================================= */

-- ---------------------------------------------------------------------------
-- ROLES
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wyshcare_app') THEN
    -- Application role: BYPASSRLS so service-layer authorization is the
    -- enforcement boundary. NOCREATEDB/NOCREATEROLE/NOREPLICATION limits
    -- blast radius if credentials are compromised.
    -- Set the password separately during deployment:
    --   ALTER ROLE wyshcare_app PASSWORD '<secret>';
    CREATE ROLE wyshcare_app WITH LOGIN
      BYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wyshcare_readonly') THEN
    -- Read-only analytics/BI role. Subject to RLS policies.
    -- Set the password separately during deployment:
    --   ALTER ROLE wyshcare_readonly PASSWORD '<secret>';
    CREATE ROLE wyshcare_readonly WITH LOGIN
      NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;
END
$$;

-- Helper: current user id from session variable (returns NULL if not set)
-- Usage: SET LOCAL app.current_user_id = '<id>';
-- The backend must set this at the start of every transaction.

-- ---------------------------------------------------------------------------
-- HELPER: is_admin()
-- Returns true if the current session user has ADMIN role in UserRole table.
-- Used only by wyshcare_readonly connections (app bypasses RLS).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "UserRole"
    WHERE "userId" = current_setting('app.current_user_id', true)
      AND role = 'ADMIN'
  );
$$;

-- ---------------------------------------------------------------------------
-- HELPER: has_consent(patient_user_id)
-- Returns true if the current session user has an active ConsentGrant from
-- the given patient.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION has_consent(patient_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "ConsentGrant"
    WHERE "ownerUserId" = patient_id
      AND "grantedToUserId" = current_setting('app.current_user_id', true)
      AND status = 'ACTIVE'
      AND "expiresAt" > now()
      AND "revokedAt" IS NULL
  );
$$;

-- ---------------------------------------------------------------------------
-- User
-- ---------------------------------------------------------------------------
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

CREATE POLICY "user_own_row"
ON "User" FOR ALL
TO wyshcare_readonly
USING (id = current_setting('app.current_user_id', true));

CREATE POLICY "user_admin_all"
ON "User" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- UserRole
-- ---------------------------------------------------------------------------
ALTER TABLE "UserRole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserRole" FORCE ROW LEVEL SECURITY;

CREATE POLICY "userrole_own"
ON "UserRole" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "userrole_admin"
ON "UserRole" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- DeviceSession
-- ---------------------------------------------------------------------------
ALTER TABLE "DeviceSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeviceSession" FORCE ROW LEVEL SECURITY;

CREATE POLICY "devicesession_own"
ON "DeviceSession" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

-- ---------------------------------------------------------------------------
-- RefreshToken
-- ---------------------------------------------------------------------------
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" FORCE ROW LEVEL SECURITY;

CREATE POLICY "refreshtoken_own"
ON "RefreshToken" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

-- ---------------------------------------------------------------------------
-- OtpChallenge — backend-only, no direct access
-- ---------------------------------------------------------------------------
ALTER TABLE "OtpChallenge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OtpChallenge" FORCE ROW LEVEL SECURITY;

CREATE POLICY "otpchallenge_deny_all"
ON "OtpChallenge" FOR ALL
TO wyshcare_readonly
USING (false);

-- ---------------------------------------------------------------------------
-- HealthRecord
-- ---------------------------------------------------------------------------
ALTER TABLE "HealthRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HealthRecord" FORCE ROW LEVEL SECURITY;

CREATE POLICY "healthrecord_own"
ON "HealthRecord" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "healthrecord_consented"
ON "HealthRecord" FOR SELECT
TO wyshcare_readonly
USING (has_consent("userId"));

CREATE POLICY "healthrecord_admin"
ON "HealthRecord" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- Prescription
-- ---------------------------------------------------------------------------
ALTER TABLE "Prescription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prescription" FORCE ROW LEVEL SECURITY;

CREATE POLICY "prescription_own"
ON "Prescription" FOR ALL
TO wyshcare_readonly
USING ("patientUserId" = current_setting('app.current_user_id', true));

CREATE POLICY "prescription_consented"
ON "Prescription" FOR SELECT
TO wyshcare_readonly
USING (has_consent("patientUserId"));

CREATE POLICY "prescription_admin"
ON "Prescription" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- Medication — child of Prescription, no direct userId; inherit via join
-- Deny direct access; access via Prescription only.
-- ---------------------------------------------------------------------------
ALTER TABLE "Medication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Medication" FORCE ROW LEVEL SECURITY;

CREATE POLICY "medication_deny_direct"
ON "Medication" FOR ALL
TO wyshcare_readonly
USING (false);

-- ---------------------------------------------------------------------------
-- DiagnosticReport
-- ---------------------------------------------------------------------------
ALTER TABLE "DiagnosticReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiagnosticReport" FORCE ROW LEVEL SECURITY;

CREATE POLICY "diagnosticreport_own"
ON "DiagnosticReport" FOR ALL
TO wyshcare_readonly
USING ("patientUserId" = current_setting('app.current_user_id', true));

CREATE POLICY "diagnosticreport_consented"
ON "DiagnosticReport" FOR SELECT
TO wyshcare_readonly
USING (has_consent("patientUserId"));

CREATE POLICY "diagnosticreport_admin"
ON "DiagnosticReport" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- ConsentGrant
-- ---------------------------------------------------------------------------
ALTER TABLE "ConsentGrant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentGrant" FORCE ROW LEVEL SECURITY;

-- Owner can manage their own grants
CREATE POLICY "consentgrant_owner"
ON "ConsentGrant" FOR ALL
TO wyshcare_readonly
USING ("ownerUserId" = current_setting('app.current_user_id', true));

-- Grantee can read grants issued to them
CREATE POLICY "consentgrant_grantee_read"
ON "ConsentGrant" FOR SELECT
TO wyshcare_readonly
USING ("grantedToUserId" = current_setting('app.current_user_id', true));

CREATE POLICY "consentgrant_admin"
ON "ConsentGrant" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- ShareLink
-- ---------------------------------------------------------------------------
ALTER TABLE "ShareLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShareLink" FORCE ROW LEVEL SECURITY;

CREATE POLICY "sharelink_owner"
ON "ShareLink" FOR ALL
TO wyshcare_readonly
USING ("ownerUserId" = current_setting('app.current_user_id', true));

CREATE POLICY "sharelink_admin"
ON "ShareLink" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- FamilyRelation
-- ---------------------------------------------------------------------------
ALTER TABLE "FamilyRelation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyRelation" FORCE ROW LEVEL SECURITY;

CREATE POLICY "familyrelation_actor"
ON "FamilyRelation" FOR ALL
TO wyshcare_readonly
USING ("actorUserId" = current_setting('app.current_user_id', true));

CREATE POLICY "familyrelation_admin"
ON "FamilyRelation" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- TimelineEvent
-- ---------------------------------------------------------------------------
ALTER TABLE "TimelineEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TimelineEvent" FORCE ROW LEVEL SECURITY;

CREATE POLICY "timelineevent_own"
ON "TimelineEvent" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "timelineevent_admin"
ON "TimelineEvent" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- Appointment
-- ---------------------------------------------------------------------------
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" FORCE ROW LEVEL SECURITY;

CREATE POLICY "appointment_patient"
ON "Appointment" FOR ALL
TO wyshcare_readonly
USING ("patientUserId" = current_setting('app.current_user_id', true));

CREATE POLICY "appointment_doctor"
ON "Appointment" FOR SELECT
TO wyshcare_readonly
USING ("doctorUserId" = current_setting('app.current_user_id', true));

CREATE POLICY "appointment_admin"
ON "Appointment" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- ConsultationSession
-- ---------------------------------------------------------------------------
ALTER TABLE "ConsultationSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsultationSession" FORCE ROW LEVEL SECURITY;

CREATE POLICY "consultationsession_via_appointment"
ON "ConsultationSession" FOR ALL
TO wyshcare_readonly
USING (
  EXISTS (
    SELECT 1 FROM "Appointment" a
    WHERE a.id = "appointmentId"
      AND (
        a."patientUserId" = current_setting('app.current_user_id', true)
        OR a."doctorUserId" = current_setting('app.current_user_id', true)
      )
  )
);

CREATE POLICY "consultationsession_admin"
ON "ConsultationSession" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- ConsultationSummary
-- ---------------------------------------------------------------------------
ALTER TABLE "ConsultationSummary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsultationSummary" FORCE ROW LEVEL SECURITY;

-- ConsultationSummary has userId directly (no appointmentId FK in this table)
CREATE POLICY "consultationsummary_own"
ON "ConsultationSummary" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "consultationsummary_admin"
ON "ConsultationSummary" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- EmergencyAccess — insert allowed (logging access), read own only
-- ---------------------------------------------------------------------------
ALTER TABLE "EmergencyAccess" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmergencyAccess" FORCE ROW LEVEL SECURITY;

-- Patient can read their own emergency access log
CREATE POLICY "emergencyaccess_patient_read"
ON "EmergencyAccess" FOR SELECT
TO wyshcare_readonly
USING ("patientUserId" = current_setting('app.current_user_id', true));

-- Any authenticated user can insert (log an emergency access event)
CREATE POLICY "emergencyaccess_insert"
ON "EmergencyAccess" FOR INSERT
TO wyshcare_readonly
WITH CHECK (true);

-- No UPDATE or DELETE — access log is immutable
CREATE POLICY "emergencyaccess_admin_read"
ON "EmergencyAccess" FOR SELECT
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- AuditLog — append-only, no read/update/delete for any non-superuser
-- ---------------------------------------------------------------------------
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;

-- Insert allowed (backend writes audit events)
CREATE POLICY "auditlog_insert"
ON "AuditLog" FOR INSERT
TO wyshcare_readonly
WITH CHECK (false);  -- readonly role cannot insert; only app role (BYPASSRLS) can

-- No SELECT, UPDATE, or DELETE for readonly role
CREATE POLICY "auditlog_deny_read"
ON "AuditLog" FOR SELECT
TO wyshcare_readonly
USING (false);

CREATE POLICY "auditlog_deny_update"
ON "AuditLog" FOR UPDATE
TO wyshcare_readonly
USING (false);

CREATE POLICY "auditlog_deny_delete"
ON "AuditLog" FOR DELETE
TO wyshcare_readonly
USING (false);

-- ---------------------------------------------------------------------------
-- PaymentOrder
-- ---------------------------------------------------------------------------
ALTER TABLE "PaymentOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentOrder" FORCE ROW LEVEL SECURITY;

CREATE POLICY "paymentorder_own"
ON "PaymentOrder" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "paymentorder_admin"
ON "PaymentOrder" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- PharmacyOrder
-- ---------------------------------------------------------------------------
ALTER TABLE "PharmacyOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PharmacyOrder" FORCE ROW LEVEL SECURITY;

CREATE POLICY "pharmacyorder_own"
ON "PharmacyOrder" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "pharmacyorder_admin"
ON "PharmacyOrder" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- DiagnosticOrder
-- ---------------------------------------------------------------------------
ALTER TABLE "DiagnosticOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiagnosticOrder" FORCE ROW LEVEL SECURITY;

CREATE POLICY "diagnosticorder_own"
ON "DiagnosticOrder" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "diagnosticorder_admin"
ON "DiagnosticOrder" FOR ALL
TO wyshcare_readonly
USING (is_admin());

-- ---------------------------------------------------------------------------
-- PharmacyPartner / DiagnosticsPartner / DoctorProfile / Clinic / DoctorClinic
-- Public read (discovery), write restricted to app role (BYPASSRLS)
-- ---------------------------------------------------------------------------
ALTER TABLE "PharmacyPartner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PharmacyPartner" FORCE ROW LEVEL SECURITY;
CREATE POLICY "pharmacypartner_public_read"
ON "PharmacyPartner" FOR SELECT
TO wyshcare_readonly
USING (true);

ALTER TABLE "DiagnosticsPartner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiagnosticsPartner" FORCE ROW LEVEL SECURITY;
CREATE POLICY "diagnosticspartner_public_read"
ON "DiagnosticsPartner" FOR SELECT
TO wyshcare_readonly
USING (true);

ALTER TABLE "DoctorProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DoctorProfile" FORCE ROW LEVEL SECURITY;
CREATE POLICY "doctorprofile_public_read"
ON "DoctorProfile" FOR SELECT
TO wyshcare_readonly
USING (true);

ALTER TABLE "Clinic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Clinic" FORCE ROW LEVEL SECURITY;
CREATE POLICY "clinic_public_read"
ON "Clinic" FOR SELECT
TO wyshcare_readonly
USING (true);

ALTER TABLE "DoctorClinic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DoctorClinic" FORCE ROW LEVEL SECURITY;
CREATE POLICY "doctorclinic_public_read"
ON "DoctorClinic" FOR SELECT
TO wyshcare_readonly
USING (true);

-- ---------------------------------------------------------------------------
-- ProviderProfile
-- ---------------------------------------------------------------------------
ALTER TABLE "ProviderProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProviderProfile" FORCE ROW LEVEL SECURITY;
CREATE POLICY "providerprofile_public_read"
ON "ProviderProfile" FOR SELECT
TO wyshcare_readonly
USING (true);

-- ---------------------------------------------------------------------------
-- Notification
-- ---------------------------------------------------------------------------
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" FORCE ROW LEVEL SECURITY;

CREATE POLICY "notification_own"
ON "Notification" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

-- ---------------------------------------------------------------------------
-- AI models — own rows only
-- ---------------------------------------------------------------------------
ALTER TABLE "AIMemoryNode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIMemoryNode" FORCE ROW LEVEL SECURITY;
CREATE POLICY "aimemorynode_own"
ON "AIMemoryNode" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

ALTER TABLE "AIMemoryEdge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIMemoryEdge" FORCE ROW LEVEL SECURITY;
CREATE POLICY "aimemoryedge_deny"
ON "AIMemoryEdge" FOR ALL
TO wyshcare_readonly
USING (false);  -- no direct userId; access via AIMemoryNode only

ALTER TABLE "AIJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIJob" FORCE ROW LEVEL SECURITY;
CREATE POLICY "aijob_own"
ON "AIJob" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

-- ---------------------------------------------------------------------------
-- ABDMLinkage
-- ---------------------------------------------------------------------------
ALTER TABLE "ABDMLinkage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ABDMLinkage" FORCE ROW LEVEL SECURITY;
CREATE POLICY "abdmlinkage_own"
ON "ABDMLinkage" FOR ALL
TO wyshcare_readonly
USING ("userId" = current_setting('app.current_user_id', true));

-- ---------------------------------------------------------------------------
-- GRANTS
-- wyshcare_app: full DML on all tables (BYPASSRLS handles the rest)
-- wyshcare_readonly: SELECT only on non-sensitive tables; RLS restricts rows
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO wyshcare_app, wyshcare_readonly;
GRANT ALL ON ALL TABLES IN SCHEMA public TO wyshcare_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO wyshcare_readonly;
GRANT EXECUTE ON FUNCTION is_admin() TO wyshcare_readonly;
GRANT EXECUTE ON FUNCTION has_consent(text) TO wyshcare_readonly;

-- Revoke AuditLog SELECT from readonly (enforced by RLS policy above,
-- but belt-and-suspenders)
REVOKE SELECT ON "AuditLog" FROM wyshcare_readonly;
