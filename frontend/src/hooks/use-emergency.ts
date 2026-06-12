/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/hooks/use-emergency.ts
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
 * use-emergency — Emergency module
 *
 * Responsibilities:
 * - Support emergency functionality
 *
 * Used By:
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/(platform)/app/telemedicine/page.tsx
 - frontend/src/app/(platform)/app/pharmacy/page.tsx
 - frontend/src/app/(platform)/app/consent/page.tsx
 - frontend/src/app/admin/population-health/page.tsx
 - frontend/src/app/(platform)/app/diagnostics/page.tsx
 - frontend/src/app/(platform)/app/discovery/page.tsx
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
Emergency
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
  EmergencyProfileResponse,
  EmergencyQRResponse,
  EmergencyContact,
  GrantEmergencyAccessDto,
  CreateEmergencyContactDto,
} from '@/types';

// ── Emergency Profile ────────────────────────────────────────────────

export function useEmergencyProfile() {
  return useQuery<EmergencyProfileResponse>({
    queryKey: ['emergencyProfile'],
    queryFn: () => api.getEmergencyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmergencyQR() {
  return useQuery<EmergencyQRResponse>({
    queryKey: ['emergencyQR'],
    queryFn: () => api.getEmergencyQR(),
    staleTime: 60 * 1000,
  });
}

export function useEmergencyContacts() {
  return useQuery<EmergencyContact[]>({
    queryKey: ['emergencyContacts'],
    queryFn: () => api.getEmergencyContacts(),
    staleTime: 2 * 60 * 1000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────

export function useGrantEmergencyAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GrantEmergencyAccessDto) => api.grantEmergencyAccess(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emergencyProfile'] });
      qc.invalidateQueries({ queryKey: ['emergencyContacts'] });
    },
  });
}

export function useRevokeEmergencyAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.revokeEmergencyAccess(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emergencyProfile'] });
      qc.invalidateQueries({ queryKey: ['emergencyContacts'] });
    },
  });
}

export function useAddEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmergencyContactDto) => api.addEmergencyContact(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['emergencyContacts'] }); },
  });
}

export function useDeleteEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteEmergencyContact(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['emergencyContacts'] }); },
  });
}
