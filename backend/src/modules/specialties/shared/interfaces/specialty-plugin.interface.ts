/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/shared/interfaces/specialty-plugin.interface.ts
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
 * specialty-plugin.interface — WyshID module
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

export interface SpecialtyPlugin {
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly templates: SpecialtyTemplate[];
  getRoutes(): SpecialtyRoute[];
}

export interface SpecialtyRoute {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  handler: string;
  description: string;
}

export interface SpecialtyTemplate {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
  isDefault?: boolean;
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
  validation?: Record<string, unknown>;
}

export interface SpecialtyEncounterData {
  specialtyCode: string;
  encounterId: string;
  patientId: string;
  providerId: string;
  templateId?: string;
  data: Record<string, unknown>;
  diagrams?: SpecialtyDiagram[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecialtyDiagram {
  id: string;
  type: string;
  label: string;
  annotations: DiagramAnnotation[];
  imageUrl?: string;
}

export interface DiagramAnnotation {
  id: string;
  type: 'point' | 'area' | 'freeform' | 'label';
  coordinates: Record<string, number>;
  label?: string;
  color?: string;
  findings?: string;
}
