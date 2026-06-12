/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/lib/specialty-api.ts
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
 * specialty-api — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/src/lib/api-client.ts
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

'use client';

import { request } from './api';
import type {
  SpecialtyInfo, SpecialtyTemplate, ToothInfo, DentalProcedure,
  BodyRegion, LesionType, SpecialtyEncounterData, ClinicBrandingResponse,
  ClinicTemplateData,
} from '@/types/specialties';

export const specialtyApi = {
  listSpecialties() {
    return request<SpecialtyInfo[]>('/specialties');
  },

  saveEncounter(code: string, data: {
    encounterId: string; patientId: string; providerId: string; templateId?: string;
    data: Record<string, unknown>; diagrams?: Record<string, unknown>[];
    findings?: Array<{
      category: string; findingKey: string; findingValue: Record<string, unknown>;
      severity?: string; status?: string;
    }>;
  }) {
    return request<SpecialtyEncounterData>(`/specialties/${code}/encounters`, { method: 'POST', body: data });
  },

  getHistory(code: string, patientId: string) {
    return request<SpecialtyEncounterData[]>(`/specialties/${code}/history/${patientId}`);
  },
  getFindings(code: string, patientId: string, category?: string) {
    const qs = category ? `?category=${category}` : '';
    return request<SpecialtyEncounterData[]>(`/specialties/${code}/findings/${patientId}${qs}`);
  },

  dental: {
    getToothChart() { return request<ToothInfo[]>('/specialties/dental/tooth-chart'); },
    getProcedures(category?: string) {
      const qs = category ? `?category=${category}` : '';
      return request<DentalProcedure[]>(`/specialties/dental/procedures${qs}`);
    },
    getTemplates() { return request<SpecialtyTemplate[]>('/specialties/dental/templates'); },
    getHistory(patientId: string) { return request<SpecialtyEncounterData[]>(`/specialties/dental/history/${patientId}`); },
  },

  ent: {
    getTemplates() { return request<SpecialtyTemplate[]>('/specialties/ent/templates'); },
    getHistory(patientId: string) { return request<SpecialtyEncounterData[]>(`/specialties/ent/history/${patientId}`); },
  },

  dermatology: {
    getBodyRegions() { return request<BodyRegion[]>('/specialties/dermatology/body-regions'); },
    getLesionTypes() { return request<LesionType[]>('/specialties/dermatology/lesion-types'); },
    getProcedures(category?: string) {
      const qs = category ? `?category=${category}` : '';
      return request<DentalProcedure[]>(`/specialties/dermatology/procedures${qs}`);
    },
    getTemplates() { return request<SpecialtyTemplate[]>('/specialties/dermatology/templates'); },
    getHistory(patientId: string) { return request<SpecialtyEncounterData[]>(`/specialties/dermatology/history/${patientId}`); },
  },

  ophthalmology: {
    getTemplates() { return request<SpecialtyTemplate[]>('/specialties/ophthalmology/templates'); },
    getHistory(patientId: string) { return request<SpecialtyEncounterData[]>(`/specialties/ophthalmology/history/${patientId}`); },
  },

  generalMedicine: {
    getTemplates() { return request<SpecialtyTemplate[]>('/specialties/general-medicine/templates'); },
  },

  clinicBranding: {
    get(clinicId: string) { return request<ClinicBrandingResponse>(`/clinic-branding/${clinicId}`); },
    update(clinicId: string, data: { primaryColor?: string; logoUrl?: string; theme?: Record<string, unknown> }) {
      return request<ClinicBrandingResponse>(`/clinic-branding/${clinicId}`, { method: 'PATCH', body: data });
    },
    createTemplate(clinicId: string, data: { specialtyCode: string; name: string; description?: string; templateData: Record<string, unknown> }) {
      return request<ClinicTemplateData>(`/clinic-branding/${clinicId}/templates`, { method: 'POST', body: data });
    },
    getTemplates(clinicId: string) { return request<ClinicTemplateData[]>(`/clinic-branding/${clinicId}/templates`); },
    updateTemplate(templateId: string, data: { name?: string; templateData?: Record<string, unknown>; isActive?: boolean }) {
      return request<ClinicTemplateData>(`/clinic-branding/templates/${templateId}`, { method: 'PATCH', body: data });
    },
    deleteTemplate(templateId: string) { return request<void>(`/clinic-branding/templates/${templateId}`, { method: 'DELETE' }); },
  },
};
