/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/types/specialties.ts
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
 * specialties — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
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

/* Specialty Plugin Architecture Types */

export interface SpecialtyInfo {
  code: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  type: 'form' | 'diagram' | 'chart' | 'imaging' | 'assessment' | 'measurement';
  fields: TemplateField[];
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'textarea' | 'diagram' | 'image' | 'richtext';
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}

export interface SpecialtyTemplate {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
  isDefault?: boolean;
}

export interface ToothInfo {
  number: number;
  name: string;
  quadrant: 'UR' | 'UL' | 'LR' | 'LL';
  type: 'molar' | 'premolar' | 'canine' | 'incisor';
}

export interface DentalProcedure {
  code: string;
  name: string;
  category: string;
}

export interface BodyRegion {
  id: string;
  label: string;
  parent: string;
}

export interface LesionType {
  value: string;
  label: string;
}

export interface SpecialtyEncounterData {
  id: string;
  specialtyCode: string;
  encounterId: string;
  patientId: string;
  providerId: string;
  templateId?: string;
  data: Record<string, unknown>;
  diagrams?: Record<string, unknown>[];
  createdAt: string;
}

export interface ClinicBranding {
  primaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  theme?: Record<string, unknown>;
}

export interface ClinicBrandingResponse {
  clinic: { id: string; name: string; logoUrl?: string; slug: string };
  templates: ClinicTemplateData[];
  branding: ClinicBranding;
}

export interface ClinicTemplateData {
  id: string;
  clinicId: string;
  specialtyCode: string;
  name: string;
  description?: string;
  templateData: Record<string, unknown>;
  isActive: boolean;
}
