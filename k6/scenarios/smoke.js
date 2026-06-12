/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: k6/scenarios/smoke.js
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
 * smoke — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - k6/scenarios/consultations.js
 - k6/scenarios/claims-submission.js
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

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api/v1';

const endpoints = [
  { name: 'health', path: '/health', method: 'GET' },
  { name: 'health-live', path: '/health/live', method: 'GET' },
  { name: 'health-ready', path: '/health/ready', method: 'GET' },
  { name: 'metrics', path: '/metrics', method: 'GET' },
];

export default function () {
  for (const ep of endpoints) {
    const res = http.get(`${BASE_URL}${ep.path}`);
    check(res, { [`${ep.name} ok`]: (r) => r.status === 200 });
  }

  sleep(2);
}
