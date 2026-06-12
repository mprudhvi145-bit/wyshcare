/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: k6/scenarios/consultations.js
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
 * consultations — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - k6/scenarios/smoke.js
 - k6/scenarios/claims-submission.js
 - k6/scenarios/dashboard-load.js
 *
 * Calls:
 - data
 - k6
 - http
 *
 * Dependencies:
 - data
 - k6
 - http
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

import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api/v1';

const tokens = new SharedArray('tokens', () => {
  return Array.from({ length: 100 }, (_, i) => `test-patient-token-${i}`);
});

export default function () {
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const payloads = [
    () => {
      const res = http.get(`${BASE_URL}/health`, { headers });
      check(res, { 'health responded': (r) => r.status === 200 });
    },
    () => {
      const res = http.get(`${BASE_URL}/telemedicine/appointments`, { headers });
      check(res, { 'appointments fetched': (r) => r.status === 200 });
    },
    () => {
      const res = http.post(`${BASE_URL}/telemedicine/appointments`, JSON.stringify({
        doctorProfileId: 'doctor-1',
        clinicId: 'clinic-1',
        reason: 'Follow-up consultation',
        slotStartAt: new Date(Date.now() + 86400000).toISOString(),
        slotEndAt: new Date(Date.now() + 86400000 + 1800000).toISOString(),
        consultationMode: 'VIDEO',
      }), { headers });
      check(res, { 'appointment created': (r) => r.status === 201 });
    },
  ];

  payloads[Math.floor(Math.random() * payloads.length)]();
  sleep(Math.random() * 3 + 1);
}
