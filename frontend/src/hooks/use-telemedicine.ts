/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/hooks/use-telemedicine.ts
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
 * use-telemedicine — Telemedicine module
 *
 * Responsibilities:
 * - Support telemedicine functionality
 *
 * Used By:
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/(platform)/app/telemedicine/page.tsx
 - frontend/src/app/(platform)/app/pharmacy/page.tsx
 - frontend/src/app/(platform)/app/consent/page.tsx
 - frontend/src/app/admin/population-health/page.tsx
 - frontend/src/app/(platform)/app/diagnostics/page.tsx
 *
 * Calls:
 - api-client
 - react-query
 *
 * Dependencies:
 - api-client
 - react-query
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Telemedicine
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  AppointmentResponse,
  AppointmentParams,
  CreateAppointmentDto,
  RescheduleDto,
  DoctorResponse,
  DoctorSearchParams,
  Appointment,
} from '@/types';

// ── Appointments ─────────────────────────────────────────────────────

export function useAppointments(params?: AppointmentParams) {
  return useQuery<AppointmentResponse>({
    queryKey: ['appointments', params],
    queryFn: () => api.getAppointments(params),
    staleTime: 60 * 1000,
  });
}

export function useAppointment(id: string) {
  return useQuery<Appointment>({
    queryKey: ['appointment', id],
    queryFn: () => api.getAppointment(id),
    staleTime: 60 * 1000,
    enabled: !!id,
  });
}

// ── Doctors ──────────────────────────────────────────────────────────

export function useDoctors(params?: DoctorSearchParams) {
  return useQuery<DoctorResponse>({
    queryKey: ['doctors', params],
    queryFn: () => api.getDoctors(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentDto) => api.createAppointment(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.cancelAppointment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); },
  });
}

export function useRescheduleAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleDto }) => api.rescheduleAppointment(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); },
  });
}

export function useConsultationToken(id: string) {
  return useQuery<{ token: string }>({
    queryKey: ['consultationToken', id],
    queryFn: () => api.getConsultationToken(id),
    staleTime: 0,
    enabled: !!id,
  });
}
