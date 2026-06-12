/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/lib/api.ts
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
 * api — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/src/app/os/page.tsx
 - frontend/src/app/os/layout.tsx
 - frontend/src/app/os/doctor/page.tsx
 - frontend/src/app/os/dashboard/page.tsx
 - frontend/src/app/(platform)/app/emergency/page.tsx
 - frontend/src/app/doctor/emr/page.tsx
 - frontend/src/features/auth/login-form.tsx
 *
 * Calls:
 - session-store
 *
 * Dependencies:
 - session-store
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

import type { DashboardResponse } from '@wyshcare/shared';

import { useSessionStore } from '@/stores/session-store';

import { getMockResponse } from './api-mock';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:30013';
const MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === 'true';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | object;
  retryOnAuthFailure?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (MOCK_API) {
    const mockResult = getMockResponse(path, options);
    if (mockResult) return mockResult.data as T;
  }

  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      ...options,
      headers,
      body:
        options.body && !isFormData && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : (options.body as BodyInit | undefined),
      // httpOnly cookies are sent automatically by the browser
      credentials: 'include',
    });
  } catch (err) {
    const mockResult = getMockResponse(path, options);
    if (mockResult) return mockResult.data as T;
    throw new ApiError(
      `Network error: ${(err as Error)?.message || 'Failed to connect to server'}`,
      0,
    );
  }

  const raw = (await response.json().catch(() => null)) as ApiEnvelope<T> | { message?: string } | null;

  if (response.status === 401 && options.retryOnAuthFailure !== false) {
    // Attempt silent refresh using the httpOnly refresh cookie (no token in body needed)
    try {
      await api.refreshSession();
      return request<T>(path, { ...options, retryOnAuthFailure: false });
    } catch {
      useSessionStore.getState().clearSession();
    }
  }

  if (!response.ok) {
    const mockResult = getMockResponse(path, options);
    if (mockResult) return mockResult.data as T;
    throw new ApiError((raw as { message?: string } | null)?.message ?? 'Request failed', response.status);
  }

  return (raw as ApiEnvelope<T>).data;
}

export const api = {
  requestOtp(phoneNumber: string, purpose: 'LOGIN' | 'REGISTER' | 'ACCESS_SHARE' = 'LOGIN') {
    return request<{ challengeIssued: boolean; otpPreview?: string }>('/auth/otp/request', {
      method: 'POST',
      body: { phoneNumber, purpose },
    });
  },
  verifyOtp(input: {
    phoneNumber: string;
    otpCode: string;
    deviceName: string;
    fullName?: string;
  }) {
    return request<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: { id: string; wyshId: string; fullName: string; roles: string[] };
    }>('/auth/otp/verify', {
      method: 'POST',
      body: input,
    });
  },
  /** Refresh using the httpOnly cookie — no token body required */
  refreshSession(deviceName?: string) {
    return request<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: { id: string; wyshId: string; fullName: string; roles: string[] };
    }>('/auth/refresh', {
      method: 'POST',
      body: deviceName ? { deviceName } : {},
      retryOnAuthFailure: false,
    });
  },
  logout() {
    return request<{ loggedOut: boolean }>('/auth/logout', { method: 'POST' });
  },
  getDashboard() {
    return request<DashboardResponse>('/identity/dashboard');
  },
  getIdentity() {
    return request<{
      id: string;
      wyshId: string;
      phoneNumber: string;
      fullName: string;
      preferredLanguage: string;
      bloodGroup?: string | null;
      chronicConditions: string[];
      allergiesSummary: string[];
      roles: Array<{ role: string }> | string[];
    }>('/identity/me');
  },
  getEmergencyQr() {
    return request<{ payload: Record<string, unknown>; qrDataUrl: string }>('/identity/qr?emergency=true');
  },
  getTimeline() {
    return request<
      Array<{ id: string; type: string; title: string; summary: string; occurredAt: string }>
    >('/timeline');
  },
  getRecords() {
    return request<
      Array<{
        id: string;
        title: string;
        recordType: string;
        description?: string | null;
        mimeType?: string | null;
        fileSize?: number | null;
        recordedAt: string;
      }>
    >('/vault/records');
  },
  createRecord(input: { title: string; recordType: string; description?: string }) {
    return request('/vault/records', { method: 'POST', body: input });
  },
  uploadRecord(file: File, input: { recordType: string; title?: string; description?: string }) {
    const form = new FormData();
    form.append('file', file);
    const params = new URLSearchParams({ recordType: input.recordType });

    if (input.title) params.set('title', input.title);
    if (input.description) params.set('description', input.description);

    return request(`/vault/records/upload?${params.toString()}`, {
      method: 'POST',
      body: form,
    });
  },
  getPrescriptions() {
    return request<
      Array<{
        id: string;
        diagnosisSummary?: string | null;
        instructions?: string | null;
        refillDueAt?: string | null;
        medications: Array<{ id: string; name: string; dosage?: string | null; frequency?: string | null }>;
        doctorProfile?: { user?: { fullName?: string } | null } | null;
      }>
    >('/vault/prescriptions');
  },
  searchDoctors(query?: string, specialty?: string) {
    const params = new URLSearchParams();

    if (query) params.set('query', query);
    if (specialty) params.set('specialty', specialty);

    return request<
      Array<{
        id: string;
        name: string;
        specialization: string;
        rating: number;
        consultationFee: number;
        telemedicineAvailable: boolean;
      }>
    >(`/discovery${params.size ? `?${params.toString()}` : ''}`);
  },
  getAppointments() {
    return request<
      Array<{
        id: string;
        consultationMode: string;
        reason: string;
        slotStartAt: string;
        status: string;
        doctorProfile: { id: string; specialization: string; user: { fullName: string } };
        consultationSession?: { id: string } | null;
      }>
    >('/telemedicine/appointments');
  },
  createAppointment(input: {
    doctorProfileId: string;
    consultationMode: 'VIDEO' | 'AUDIO' | 'CHAT' | 'IN_PERSON';
    reason: string;
    slotStartAt: string;
    slotEndAt?: string;
  }) {
    return request('/telemedicine/appointments', { method: 'POST', body: input });
  },
  createTelemedicineSession(appointmentId: string) {
    return request<{
      session: { id: string; livekitRoomName?: string | null };
      patientToken: string;
      doctorToken: string;
    }>(`/telemedicine/appointments/${appointmentId}/session`, { method: 'POST' });
  },
  getConsents() {
    return request<
      Array<{
        id: string;
        accessLevel: string;
        accessMethod: string;
        purpose: string;
        status: string;
        expiresAt: string;
        grantedToUser?: { fullName?: string | null } | null;
        shareUrl?: string;
      }>
    >('/consents');
  },
  createConsent(input: {
    granteeWyshId?: string;
    granteePhoneNumber?: string;
    accessLevel: 'FULL' | 'LIMITED' | 'EMERGENCY';
    accessMethod: 'MANUAL_APPROVAL' | 'OTP_APPROVAL' | 'SHARE_LINK';
    purpose: string;
    scope: Record<string, unknown>;
    expiresAt: string;
  }) {
    return request('/consents', { method: 'POST', body: input });
  },
  revokeConsent(id: string) {
    return request(`/consents/${id}/revoke`, { method: 'PATCH' });
  },
  getFamily() {
    return request<
      Array<{
        id: string;
        relationship: string;
        subject: { id: string; fullName: string; phoneNumber: string; wyshId: string };
      }>
    >('/family');
  },
  createFamilyLink(input: {
    phoneNumber: string;
    fullName: string;
    relationship: 'PARENT' | 'CHILD' | 'SPOUSE' | 'CAREGIVER' | 'SIBLING' | 'GUARDIAN';
  }) {
    return request('/family', { method: 'POST', body: input });
  },
  getPharmacyPartners() {
    return request<Array<{ id: string; name: string; city: string; supportsDelivery: boolean }>>('/pharmacy/partners');
  },
  getPharmacyOrders() {
    return request<
      Array<{
        id: string;
        status: string;
        quotedTotal?: number | null;
        partner?: { name: string } | null;
      }>
    >('/pharmacy/orders');
  },
  createPharmacyOrder(input: {
    partnerId?: string;
    prescriptionId?: string;
    deliveryAddress: Record<string, unknown>;
    medicinePayload: Array<Record<string, unknown>>;
  }) {
    return request('/pharmacy/orders', { method: 'POST', body: input });
  },
  getDiagnosticsPartners() {
    return request<Array<{ id: string; name: string; city: string; homeCollection: boolean; accreditation?: string | null }>>(
      '/diagnostics/partners',
    );
  },
  getDiagnosticsOrders() {
    return request<
      Array<{
        id: string;
        status: string;
        testCodes: string[];
        homeCollection: boolean;
        partner?: { name: string } | null;
        slotStartAt?: string | null;
      }>
    >('/diagnostics/orders');
  },
  createDiagnosticsOrder(input: {
    partnerId?: string;
    testCodes: string[];
    homeCollection?: boolean;
    slotStartAt?: string;
    slotEndAt?: string;
    notes?: string;
  }) {
    return request('/diagnostics/orders', { method: 'POST', body: input });
  },
  getDiagnosticReports() {
    return request<
      Array<{
        id: string;
        reportType: string;
        summary?: string | null;
        recordedAt: string;
        healthRecord: { id: string; title: string };
      }>
    >('/diagnostics/reports');
  },
  uploadDiagnosticReport(
    file: File,
    input: { reportType: string; partnerId?: string; diagnosticOrderId?: string; title?: string; summary?: string },
  ) {
    const form = new FormData();
    form.append('file', file);
    const params = new URLSearchParams({ reportType: input.reportType });

    if (input.partnerId) params.set('partnerId', input.partnerId);
    if (input.diagnosticOrderId) params.set('diagnosticOrderId', input.diagnosticOrderId);
    if (input.title) params.set('title', input.title);
    if (input.summary) params.set('summary', input.summary);

    return request(`/diagnostics/reports/upload?${params.toString()}`, {
      method: 'POST',
      body: form,
    });
  },
  getRecordDownloadUrl(recordId: string) {
    return request<{ url: string; expiresIn: number }>(`/vault/records/${recordId}/download-url`);
  },
  detectRole(_userId: string) {
    return request<{ role: string }>('/identity/detect-role', { method: 'POST' });
  },
};
