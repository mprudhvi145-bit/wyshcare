/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: k6/scenarios/dashboard-load.js
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
 * dashboard-load — Dashboard module
 *
 * Responsibilities:
 * - Support dashboard functionality
 *
 * Used By:
 - k6/scenarios/smoke.js
 - k6/scenarios/consultations.js
 - k6/scenarios/claims-submission.js
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
Dashboard
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
    { duration: '1m', target: 200 },
    { duration: '3m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api/v1';

const tokens = new SharedArray('tokens', () => {
  return Array.from({ length: 500 }, (_, i) => `test-patient-token-${i}`);
});

export default function () {
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const dashboardRes = http.get(`${BASE_URL}/wysh/dashboard`, { headers });
  check(dashboardRes, { 'wysh dashboard loaded': (r) => r.status === 200 });

  sleep(1);
}
