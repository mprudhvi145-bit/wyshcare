--
-- ============================================================================
-- WYSHCARE PLATFORM
-- ============================================================================
--
-- File: archive/schema-history/backend-supabase-schema.sql
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
-- SQL migration or query: backend-supabase-schema
--
-- Responsibilities:
--  * - Manage database schema and data migrations
--
-- Database:
--  - persons
 - patients
 - staff
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

create table if not exists persons (
  id text primary key default gen_random_uuid(),
  full_name text not null,
  gender text not null,
  date_of_birth date not null,
  created_at timestamptz default now()
);

create table if not exists staff (
  staff_wysh_id text primary key,
  person_id text references persons(id),
  role text not null
);

create table if not exists patients (
  patient_wysh_id text primary key,
  person_id text references persons(id)
);