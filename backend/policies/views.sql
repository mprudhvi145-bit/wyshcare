--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: backend/policies/views.sql
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
-- SQL migration or query: views
--
-- Responsibilities:
--  * - Manage database schema and data migrations
--
-- Database:
--  - OR
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
   WYSHCARE SAFE READ VIEWS
   - READ ONLY
   - NO DIRECT TABLE ACCESS
   - USED BY AI + DASHBOARDS
========================================================= */

/* ---------------------------------------------------------
   LATEST VITALS PER PATIENT
--------------------------------------------------------- */
CREATE OR REPLACE VIEW latest_vitals_per_patient AS
SELECT DISTINCT ON (v.patient_id)
  v.id,
  v.patient_id,
  v.encounter_id,
  v.systolic_bp,
  v.diastolic_bp,
  v.pulse,
  v.spo2,
  v.temperature,
  v.weight,
  v.created_at
FROM vitals v
ORDER BY v.patient_id, v.created_at DESC;

/* ---------------------------------------------------------
   VITALS — LAST 30 DAYS (FOR TRENDS)
--------------------------------------------------------- */
CREATE OR REPLACE VIEW vitals_last_30_days AS
SELECT
  v.id,
  v.patient_id,
  v.encounter_id,
  v.systolic_bp,
  v.diastolic_bp,
  v.pulse,
  v.spo2,
  v.temperature,
  v.weight,
  v.created_at
FROM vitals v
WHERE v.created_at >= now() - interval '30 days'
ORDER BY v.created_at ASC;

/* ---------------------------------------------------------
   PATIENT TIMELINE (READ-ONLY AGGREGATE)
--------------------------------------------------------- */
CREATE OR REPLACE VIEW patient_timeline AS
SELECT
  e.wysh_id            AS patient_id,
  e.id                 AS encounter_id,
  e.type               AS encounter_type,
  e.started_at         AS encounter_started_at,
  n.id                 AS note_id,
  n.type               AS note_type,
  n.created_at         AS note_created_at,
  v.id                 AS vitals_id,
  v.created_at         AS vitals_recorded_at
FROM encounters e
LEFT JOIN clinical_notes n ON n.encounter_id = e.id
LEFT JOIN vitals v ON v.encounter_id = e.id;

/* ---------------------------------------------------------
   AI HEALTH HISTORY (PATIENT SAFE)
--------------------------------------------------------- */
CREATE OR REPLACE VIEW ai_health_history AS
SELECT
  a.id,
  a.patient_id,
  a.vitals_id,
  a.patient_question,
  a.ai_response,
  a.risk_level,
  a.created_at
FROM ai_health_analysis a
ORDER BY a.created_at DESC;