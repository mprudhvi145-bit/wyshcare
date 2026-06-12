--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/policies/grants.sql
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
-- SQL migration or query: grants
--
-- Responsibilities:
--  * - Manage database schema and data migrations
--
-- Database:
--  - ON
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

/* =========================================================
   WYSHCARE DATABASE ACCESS GRANTS
   ---------------------------------------------------------
   Purpose:
   - Enforce least-privilege access
   - Separate read vs write responsibilities
   - Protect PHI and AI audit logs
========================================================= */

/* ---------------------------------------------------------
   ROLES (Supabase standard)
--------------------------------------------------------- */
-- anon      : unauthenticated
-- authenticated : logged-in users
-- service_role  : backend-only (trusted)

/* ---------------------------------------------------------
   PUBLIC / SAFE READS
--------------------------------------------------------- */
-- Allow public read-only access to NON-PHI reference data
GRANT SELECT ON TABLE organizations TO anon;
GRANT SELECT ON TABLE organizations TO authenticated;

/* ---------------------------------------------------------
   PATIENT-OWNED DATA
--------------------------------------------------------- */
-- Patients table (NO public access)
REVOKE ALL ON TABLE patients FROM anon;
REVOKE ALL ON TABLE patients FROM authenticated;

-- Backend only
GRANT SELECT, INSERT, UPDATE ON TABLE patients TO service_role;

/* ---------------------------------------------------------
   ENCOUNTERS
--------------------------------------------------------- */
REVOKE ALL ON TABLE encounters FROM anon;
REVOKE ALL ON TABLE encounters FROM authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE encounters TO service_role;

/* ---------------------------------------------------------
   VITALS
--------------------------------------------------------- */
REVOKE ALL ON TABLE vitals FROM anon;
REVOKE ALL ON TABLE vitals FROM authenticated;

GRANT SELECT, INSERT ON TABLE vitals TO service_role;

/* ---------------------------------------------------------
   CLINICAL NOTES
--------------------------------------------------------- */
REVOKE ALL ON TABLE clinical_notes FROM anon;
REVOKE ALL ON TABLE clinical_notes FROM authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE clinical_notes TO service_role;

/* ---------------------------------------------------------
   CONSENTS
--------------------------------------------------------- */
REVOKE ALL ON TABLE consents FROM anon;
REVOKE ALL ON TABLE consents FROM authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE consents TO service_role;

/* ---------------------------------------------------------
   PRESCRIPTIONS
--------------------------------------------------------- */
REVOKE ALL ON TABLE prescriptions FROM anon;
REVOKE ALL ON TABLE prescriptions FROM authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE prescriptions TO service_role;

/* ---------------------------------------------------------
   AI HEALTH ANALYSIS
--------------------------------------------------------- */
REVOKE ALL ON TABLE ai_health_analysis FROM anon;
REVOKE ALL ON TABLE ai_health_analysis FROM authenticated;

GRANT SELECT, INSERT ON TABLE ai_health_analysis TO service_role;

/* ---------------------------------------------------------
   AI AUDIT LOGS (IMMUTABLE)
--------------------------------------------------------- */
REVOKE ALL ON TABLE audit_logs FROM anon;
REVOKE ALL ON TABLE audit_logs FROM authenticated;

-- Insert-only for backend
GRANT INSERT ON TABLE audit_logs TO service_role;

/* ---------------------------------------------------------
   VIEWS (READ-ONLY)
--------------------------------------------------------- */
-- Latest vitals view
GRANT SELECT ON TABLE latest_vitals_per_patient TO service_role;

-- Trends view
GRANT SELECT ON TABLE vitals_last_30_days TO service_role;

/* ---------------------------------------------------------
   FUNCTIONS (RPC)
--------------------------------------------------------- */
GRANT EXECUTE ON FUNCTION write_ai_health_analysis TO service_role;

/* ---------------------------------------------------------
   DEFAULT SAFETY
--------------------------------------------------------- */
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM authenticated;