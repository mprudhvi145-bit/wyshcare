/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: k6/scenarios/claims-submission.js
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
 * claims-submission — AI module
 *
 * Responsibilities:
 * - Support ai functionality
 *
 * Used By:
 - k6/scenarios/smoke.js
 - k6/scenarios/consultations.js
 - k6/scenarios/dashboard-load.js
 *
 * Calls:
 - k6
 - http
 *
 * Dependencies:
 - k6
 - http
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
AI
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

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<4000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api/v1';
const TOKEN = __ENV.TOKEN || 'admin-test-token';

export default function () {
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  const policyRes = http.get(`${BASE_URL}/insurance/policies?status=ACTIVE`, { headers });
  check(policyRes, { 'policies fetched': (r) => r.status === 200 });

  if (policyRes.status !== 200) {
    sleep(1);
    return;
  }

  const body = JSON.stringify({
    policyId: 'test-policy-id',
    clinicId: 'clinic-1',
    totalAmount: 500000,
    claimedAmount: 400000,
    items: [
      { description: 'Consultation fee', category: 'OPD', claimedAmount: 200000 },
      { description: 'Lab tests', category: 'DIAGNOSTIC', claimedAmount: 200000 },
    ],
  });

  const createRes = http.post(`${BASE_URL}/insurance/claims`, body, { headers });
  check(createRes, { 'claim created': (r) => r.status === 201 });

  if (createRes.status === 201) {
    sleep(0.5);
  }

  sleep(2);
}
