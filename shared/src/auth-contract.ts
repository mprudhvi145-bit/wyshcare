/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: shared/src/auth-contract.ts
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
 * auth-contract — Authentication module
 *
 * Responsibilities:
 * - Support authentication functionality
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
Authentication
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

export const AUTH_SESSION_COOKIE_NAME = 'wyshcare_session';
export const AUTH_SESSION_STORAGE_KEY = 'wyshcare_auth_session';

export type AppRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'NURSE'
  | 'CAREGIVER'
  | 'CLINIC_MANAGER'
  | 'PHARMACY_PARTNER'
  | 'LAB_PARTNER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'SUPPORT'
  | 'SYSTEM';

export type AuthSession = {
  userId: string;
  role: AppRole;
  patientWyshId?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export function serializeAuthSession(session: AuthSession) {
  return encodeURIComponent(JSON.stringify(session));
}

export function parseAuthSession(raw: string): AuthSession | null {
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as Partial<AuthSession>;

    if (
      typeof parsed.userId === 'string' &&
      typeof parsed.role === 'string' &&
      typeof parsed.accessToken === 'string' &&
      typeof parsed.refreshToken === 'string' &&
      typeof parsed.expiresAt === 'number'
    ) {
      return parsed as AuthSession;
    }

    return null;
  } catch {
    return null;
  }
}

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function canAccessPath(session: AuthSession, pathname: string) {
  if (session.role === 'ADMIN') {
    return startsWithAny(pathname, ['/admin', '/app', '/doctor', '/login', '/unauthorized']);
  }

  if (session.role === 'PATIENT') {
    return startsWithAny(pathname, ['/app', '/login', '/unauthorized']);
  }

  if (session.role === 'DOCTOR' || session.role === 'CLINIC_MANAGER') {
    return startsWithAny(pathname, ['/doctor', '/app', '/login', '/unauthorized']);
  }

  if (session.role === 'PHARMACY_PARTNER' || session.role === 'LAB_PARTNER' || session.role === 'SUPPORT') {
    return startsWithAny(pathname, ['/app', '/login', '/unauthorized']);
  }

  return false;
}
