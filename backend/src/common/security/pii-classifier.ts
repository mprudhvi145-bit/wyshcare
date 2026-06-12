/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/security/pii-classifier.ts
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
 * pii-classifier — WyshID module
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

export type PiiCategory = 'aadhaar' | 'pan' | 'phone' | 'email' | 'abha' | 'name' | 'dob' | 'address' | 'none';

export interface PiiClassification {
  categories: PiiCategory[];
  confidence: number;
  hasPii: boolean;
}

const AADHAAR_REGEX = /\b[2-9]\d{11}\b/;
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/;
const PHONE_REGEX = /\b(\+91|0)?[6-9]\d{9}\b/;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const ABHA_REGEX = /\b\d{2}-\d{4}-\d{4}-\d{4}\b/;

export function classifyPii(text: string): PiiClassification {
  const categories: PiiCategory[] = [];

  if (AADHAAR_REGEX.test(text)) categories.push('aadhaar');
  if (PAN_REGEX.test(text)) categories.push('pan');
  if (PHONE_REGEX.test(text)) categories.push('phone');
  if (EMAIL_REGEX.test(text)) categories.push('email');
  if (ABHA_REGEX.test(text)) categories.push('abha');

  return {
    categories,
    confidence: categories.length > 0 ? 0.95 : 0,
    hasPii: categories.length > 0,
  };
}

export function maskPii(text: string): string {
  return text
    .replace(AADHAAR_REGEX, (m) => `XXXX XXXX ${m.slice(-4)}`)
    .replace(PAN_REGEX, (m) => `XXXXXXXX${m.slice(-1)}`)
    .replace(PHONE_REGEX, (m) => `XXXXXX${m.slice(-4)}`)
    .replace(EMAIL_REGEX, (m) => {
      const parts = m.split('@');
      const local = parts[0] ?? '';
      const domain = parts[1] ?? '';
      return `${local[0]}${'*'.repeat(Math.max(0, local.length - 2))}${local[local.length - 1]}@${domain}`;
    })
    .replace(ABHA_REGEX, () => 'XX-XXXX-XXXX-XXXX');
}
