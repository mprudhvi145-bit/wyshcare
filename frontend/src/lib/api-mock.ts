/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/lib/api-mock.ts
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
 * api-mock — WyshID module
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

const mockDb: Array<{ pattern: RegExp; factory: () => any }> = [];

function mock<T>(pathPattern: RegExp, factory: () => T) {
  mockDb.push({ pattern: pathPattern, factory });
}

function findMock(path: string): (() => any) | undefined {
  for (const { pattern, factory } of mockDb) {
    if (pattern.test(path)) return factory;
  }
}

// ── Auth ──────────────────────────────────────────────────────────────
mock(/^\/auth\/otp\/request/, () => ({ challengeIssued: true, otpPreview: '123456' }));
mock(/^\/auth\/otp\/verify/, () => ({
  accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', expiresIn: 3600,
  user: { id: 'user-1', wyshId: 'WYSH-8A3F2C', fullName: 'Ananya Sharma', roles: ['PATIENT'] },
}));
mock(/^\/auth\/refresh/, () => ({
  accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', expiresIn: 3600,
  user: { id: 'user-1', wyshId: 'WYSH-8A3F2C', fullName: 'Ananya Sharma', roles: ['PATIENT'] },
}));
mock(/^\/auth\/logout/, () => ({ loggedOut: true }));

// ── Identity ──────────────────────────────────────────────────────────
mock(/^\/identity\/dashboard/, () => ({
  profile: { fullName: 'Ananya Sharma', wyshId: 'WYSH-8A3F2C', bloodGroup: 'O+' },
  timeline: [
    { id: 'evt-1', type: 'CHECKUP', title: 'Annual Health Checkup', summary: 'Routine blood work and vitals within normal range.', occurredAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'evt-2', type: 'PRESCRIPTION', title: 'Vitamin D Supplement', summary: 'Prescribed 60K IU weekly for 8 weeks.', occurredAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: 'evt-3', type: 'REPORT', title: 'Lipid Profile', summary: 'Total cholesterol borderline at 210 mg/dL.', occurredAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  ],
  activeConsents: [
    { id: 'con-1', accessLevel: 'LIMITED', accessMethod: 'SHARE_LINK', purpose: 'Annual checkup records', status: 'ACTIVE', expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(), grantedToUser: { fullName: 'Dr. Rajesh Kumar' } },
    { id: 'con-2', accessLevel: 'EMERGENCY', accessMethod: 'QR', purpose: 'Emergency triage', status: 'ACTIVE', expiresAt: new Date(Date.now() + 365 * 86400000).toISOString() },
  ],
  careTeam: [
    { id: 'doc-1', fullName: 'Dr. Rajesh Kumar', specialization: 'General Physician', languages: ['English', 'Hindi'] },
    { id: 'doc-2', fullName: 'Dr. Sneha Patel', specialization: 'Cardiology', languages: ['English', 'Gujarati'] },
  ],
  alerts: [
    { id: 'alt-1', title: 'Follow-up due', description: 'Lipid profile follow-up recommended within 2 weeks.', severity: 'MEDIUM' },
  ],
}));

mock(/^\/identity\/detect-role/, () => ({ role: 'DOCTOR' }));

mock(/^\/identity\/qr/, () => ({
  payload: { wyshId: 'WYSH-8A3F2C', bloodGroup: 'O+', emergencyContact: '+919876543210' },
  qrDataUrl: '',
}));

mock(/^\/identity\/me/, () => ({
  id: 'user-1', wyshId: 'WYSH-8A3F2C', phoneNumber: '+919876543210',
  fullName: 'Ananya Sharma', preferredLanguage: 'en',
  bloodGroup: 'O+', chronicConditions: ['Asthma'], allergiesSummary: ['Penicillin', 'Peanuts'],
  roles: [{ role: 'PATIENT' }],
}));

// ── Consents ──────────────────────────────────────────────────────────
mock(/^\/consents/, () => [
  { id: 'con-1', accessLevel: 'FULL', accessMethod: 'MANUAL_APPROVAL', purpose: 'Primary care', status: 'ACTIVE', expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(), grantedToUser: { fullName: 'Dr. Rajesh Kumar' } },
  { id: 'con-2', accessLevel: 'LIMITED', accessMethod: 'SHARE_LINK', purpose: 'Lab reports', status: 'ACTIVE', expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(), shareUrl: 'https://share.wyshcare/abc123' },
  { id: 'con-3', accessLevel: 'EMERGENCY', accessMethod: 'OTP_APPROVAL', purpose: 'Emergency', status: 'REVOKED', expiresAt: new Date(Date.now() - 10 * 86400000).toISOString() },
]);

// ── Vault ─────────────────────────────────────────────────────────────
mock(/^\/vault\/records/, () => [
  { id: 'rec-1', title: 'Blood Report - March 2026', recordType: 'LAB_REPORT', description: 'Complete blood count and lipid profile.', mimeType: 'application/pdf', fileSize: 245000, recordedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'rec-2', title: 'Chest X-Ray', recordType: 'IMAGING', description: 'PA view chest radiograph.', mimeType: 'image/jpeg', fileSize: 1200000, recordedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 'rec-3', title: 'Discharge Summary', recordType: 'DOCUMENT', mimeType: 'application/pdf', fileSize: 89000, recordedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
]);

mock(/^\/vault\/prescriptions/, () => [
  { id: 'rx-1', diagnosisSummary: 'Vitamin D deficiency', instructions: 'Take once weekly after meal', refillDueAt: new Date(Date.now() + 30 * 86400000).toISOString(), medications: [{ id: 'med-1', name: 'Vitamin D3 60K IU', dosage: '1 capsule weekly', frequency: 'Once a week' }], doctorProfile: { user: { fullName: 'Dr. Rajesh Kumar' } } },
  { id: 'rx-2', diagnosisSummary: 'Seasonal allergies', instructions: 'Take as needed', medications: [{ id: 'med-2', name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily as needed' }], doctorProfile: { user: { fullName: 'Dr. Priya Singh' } } },
]);

// ── Pharmacy ──────────────────────────────────────────────────────────
mock(/^\/pharmacy\/partners/, () => [
  { id: 'ph-1', name: 'MedPlus Pharmacy', city: 'Mumbai', supportsDelivery: true },
  { id: 'ph-2', name: 'Apollo Pharmacy', city: 'Mumbai', supportsDelivery: true },
  { id: 'ph-3', name: 'Wellness Forever', city: 'Mumbai', supportsDelivery: true },
]);

mock(/^\/pharmacy\/orders/, () => [
  { id: 'po-1', status: 'DELIVERED', quotedTotal: 450, partner: { name: 'MedPlus Pharmacy' } },
  { id: 'po-2', status: 'PROCESSING', quotedTotal: 890, partner: { name: 'Apollo Pharmacy' } },
]);

// ── Diagnostics ───────────────────────────────────────────────────────
mock(/^\/diagnostics\/partners/, () => [
  { id: 'dp-1', name: 'Thyrocare', city: 'Mumbai', homeCollection: true, accreditation: 'NABL' },
  { id: 'dp-2', name: 'Dr. Lal PathLabs', city: 'Mumbai', homeCollection: true, accreditation: 'NABL' },
  { id: 'dp-3', name: 'Metropolis Healthcare', city: 'Mumbai', homeCollection: false, accreditation: 'NABL' },
]);

mock(/^\/diagnostics\/orders/, () => [
  { id: 'do-1', status: 'REPORT_AVAILABLE', testCodes: ['CBC', 'LIPID'], homeCollection: true, partner: { name: 'Thyrocare' }, slotStartAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'do-2', status: 'SCHEDULED', testCodes: ['HbA1c', 'VITD'], homeCollection: true, partner: { name: 'Dr. Lal PathLabs' }, slotStartAt: new Date(Date.now() + 1 * 86400000).toISOString() },
]);

mock(/^\/diagnostics\/reports/, () => [
  { id: 'dr-1', reportType: 'BIOCHEMISTRY', summary: 'All values within normal range.', recordedAt: new Date(Date.now() - 3 * 86400000).toISOString(), healthRecord: { id: 'rec-1', title: 'CBC Report' } },
]);

// ── Discovery ─────────────────────────────────────────────────────────
mock(/^\/discovery/, () => [
  { id: 'doc-1', name: 'Dr. Rajesh Kumar', specialization: 'General Physician', rating: 4.5, consultationFee: 500, telemedicineAvailable: true },
  { id: 'doc-2', name: 'Dr. Sneha Patel', specialization: 'Cardiologist', rating: 4.8, consultationFee: 1200, telemedicineAvailable: true },
  { id: 'doc-3', name: 'Dr. Amit Verma', specialization: 'Orthopedic', rating: 4.3, consultationFee: 800, telemedicineAvailable: false },
  { id: 'doc-4', name: 'Dr. Priya Singh', specialization: 'Dermatologist', rating: 4.6, consultationFee: 1000, telemedicineAvailable: true },
  { id: 'doc-5', name: 'Dr. Vikram Joshi', specialization: 'ENT Specialist', rating: 4.2, consultationFee: 600, telemedicineAvailable: true },
]);

// ── Telemedicine ──────────────────────────────────────────────────────
mock(/^\/telemedicine\/appointments/, () => [
  { id: 'apt-1', consultationMode: 'VIDEO', reason: 'Follow-up on blood reports', slotStartAt: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'SCHEDULED', doctorProfile: { id: 'doc-1', specialization: 'General Physician', user: { fullName: 'Dr. Rajesh Kumar' } } },
  { id: 'apt-2', consultationMode: 'CHAT', reason: 'Skin rash consultation', slotStartAt: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'COMPLETED', doctorProfile: { id: 'doc-4', specialization: 'Dermatologist', user: { fullName: 'Dr. Priya Singh' } }, consultationSession: { id: 'sess-1' } },
]);

// ── Family ────────────────────────────────────────────────────────────
mock(/^\/family/, () => [
  { id: 'fam-1', relationship: 'SPOUSE', subject: { id: 'u-2', fullName: 'Arjun Sharma', phoneNumber: '+919876543211', wyshId: 'WYSH-7B2E1D' } },
  { id: 'fam-2', relationship: 'CHILD', subject: { id: 'u-3', fullName: 'Riya Sharma', phoneNumber: '+919876543212', wyshId: 'WYSH-6C1F0A' } },
]);

// ── Timeline (patient) ────────────────────────────────────────────────
mock(/^\/timeline$/, () => [
  { id: 'tl-1', type: 'CHECKUP', title: 'Annual Health Checkup', summary: 'Routine blood work and vitals.', occurredAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'tl-2', type: 'PRESCRIPTION', title: 'Vitamin D Supplement', summary: 'Prescribed 60K IU weekly.', occurredAt: new Date(Date.now() - 14 * 86400000).toISOString() },
]);

// ── Insurance ─────────────────────────────────────────────────────────
mock(/^\/insurance\/policies\/[^/]+$/, () => ({
  id: 'pol-1', policyNumber: 'POL-2026-001', provider: 'Star Health', plan: 'Family Health Optima',
  sumInsured: 500000, premium: 12000, status: 'ACTIVE', startDate: '2026-01-01', endDate: '2027-01-01',
}));
mock(/^\/insurance\/policies/, () => [
  { id: 'pol-1', policyNumber: 'POL-2026-001', provider: 'Star Health', plan: 'Family Health Optima', sumInsured: 500000, premium: 12000, status: 'ACTIVE', startDate: '2026-01-01', endDate: '2027-01-01' },
  { id: 'pol-2', policyNumber: 'POL-2026-002', provider: 'HDFC ERGO', plan: 'Critical Illness Cover', sumInsured: 1000000, premium: 8500, status: 'ACTIVE', startDate: '2026-03-01', endDate: '2027-03-01' },
]);
mock(/^\/insurance\/providers/, () => [
  { id: 'ip-1', name: 'Star Health', type: 'HEALTH', isActive: true },
  { id: 'ip-2', name: 'HDFC ERGO', type: 'HEALTH', isActive: true },
  { id: 'ip-3', name: 'ICICI Lombard', type: 'HEALTH', isActive: true },
]);
mock(/^\/insurance\/plans/, () => [
  { id: 'plan-1', providerId: 'ip-1', name: 'Family Health Optima', type: 'FAMILY_FLOATER', sumInsured: 500000 },
  { id: 'plan-2', providerId: 'ip-2', name: 'Critical Illness Cover', type: 'CRITICAL_ILLNESS', sumInsured: 1000000 },
]);
mock(/^\/insurance\/pre-auths\/[^/]+$/, () => ({
  id: 'pa-1', status: 'APPROVED', approvedAmount: 45000, reviewerNotes: 'Approved as per policy terms',
}));
mock(/^\/insurance\/pre-auths/, () => [
  { id: 'pa-1', policyId: 'pol-1', patientUserId: 'user-1', status: 'APPROVED', requestedAmount: 50000, approvedAmount: 45000, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'pa-2', policyId: 'pol-2', patientUserId: 'user-1', status: 'PENDING', requestedAmount: 200000, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
]);
mock(/^\/insurance\/claims\/[^/]+\/analysis/, () => ({
  claimId: 'cl-1', estimatedApproval: 0.85, flags: [], recommendations: ['Submit with all supporting documents'],
}));
mock(/^\/insurance\/claims\/[^/]+\/denial-risk/, () => ({
  claimId: 'cl-1', riskScore: 0.15, factors: [], overallRisk: 'LOW',
}));
mock(/^\/insurance\/claims\/[^/]+$/, () => ({
  id: 'cl-1', claimNumber: 'CL-2026-001', policyId: 'pol-1', amount: 45000, status: 'SUBMITTED',
}));
mock(/^\/insurance\/claims/, () => [
  { id: 'cl-1', claimNumber: 'CL-2026-001', policyId: 'pol-1', patientUserId: 'user-1', amount: 45000, status: 'SUBMITTED', createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 'cl-2', claimNumber: 'CL-2026-002', policyId: 'pol-2', patientUserId: 'user-1', amount: 120000, status: 'APPROVED', createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
]);
mock(/^\/insurance\/eligibility\/check/, () => ({
  policyId: 'pol-1', eligible: true, coverage: 0.8, maxCoverage: 400000, deductible: 5000,
}));
mock(/^\/insurance\/eligibility\/history/, () => [
  { id: 'eh-1', policyId: 'pol-1', eligible: true, amount: 45000, checkedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
]);

// ── Wysh Dashboard ────────────────────────────────────────────────────
mock(/^\/wysh\/dashboard/, () => ({
  greeting: 'Good morning',
  healthScore: { score: 82, label: 'Good', color: '#10b981' },
  todayTasks: [
    { id: 'task-1', type: 'medication', title: 'Vitamin D3', description: 'Take 1 capsule after breakfast', urgent: true },
    { id: 'task-2', type: 'appointment', title: 'Blood test follow-up', description: 'Review results with Dr. Kumar at 4 PM', urgent: false },
  ],
  upcomingAppointments: [
    { id: 'apt-1', reason: 'Follow-up consultation', doctorName: 'Dr. Rajesh Kumar', startAt: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'SCHEDULED' },
  ],
  insurance: { provider: 'Star Health', plan: 'Family Health Optima', sumInsured: 500000, status: 'ACTIVE' },
  pendingClaims: [{ id: 'cl-1', claimNumber: 'CL-2026-001', amount: 25000, status: 'UNDER_REVIEW' }],
  familyAlerts: [
    { id: 'fa-1', severity: 'HIGH', title: 'Missed vaccination', memberName: 'Riya Sharma' },
    { id: 'fa-2', severity: 'MEDIUM', title: 'Annual checkup due', memberName: 'Arjun Sharma' },
  ],
  aiInsight: { message: 'Your Vitamin D levels have improved 40% since last month. Keep up the weekly supplement routine.', type: 'medication' },
}));

// ── Health Graph V2 (patient-specific) ────────────────────────────────
mock(/^\/health-graph-v2\/lifestyle\/(?!stats)/, () => ({
  sleepHours: 7.5, activityLevel: 'MODERATE', smoking: false, alcohol: 'OCCASIONAL',
  dietType: 'BALANCED', waterIntake: 2.5, stressLevel: 6,
}));
mock(/^\/health-graph-v2\/symptoms\/(?!stats)/, () => [
  { id: 'sym-1', symptom: 'Headache', severity: 'MILD', reportedAt: new Date(Date.now() - 2 * 86400000).toISOString(), resolved: false },
  { id: 'sym-2', symptom: 'Fatigue', severity: 'MODERATE', reportedAt: new Date(Date.now() - 5 * 86400000).toISOString(), resolved: true },
]);
mock(/^\/health-graph-v2\/family-history\/(?!stats)/, () => [
  { id: 'fh-1', relationship: 'FATHER', condition: 'Type 2 Diabetes', ageOfOnset: 52, notes: 'Managed with oral medication' },
  { id: 'fh-2', relationship: 'MOTHER', condition: 'Hypertension', ageOfOnset: 58, notes: 'Under control with lifestyle changes' },
]);
mock(/^\/health-graph-v2\/prevention\/(?!stats)/, () => [
  { id: 'pv-1', title: 'Diabetes Screening', description: 'HbA1c test recommended due to family history', dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), status: 'PENDING', category: 'SCREENING' },
  { id: 'pv-2', title: 'Flu Vaccination', description: 'Annual influenza vaccination', dueDate: new Date(Date.now() + 60 * 86400000).toISOString(), status: 'COMPLETED', category: 'IMMUNIZATION' },
]);
mock(/^\/health-graph-v2\/risk\/history\/(?!stats)/, () => [
  { id: 'rh-1', condition: 'Type 2 Diabetes', risk: 'MODERATE', probability: 0.32, assessedAt: new Date(Date.now() - 7 * 86400000).toISOString(), factors: ['Family history', 'Age > 45'] },
  { id: 'rh-2', condition: 'Cardiovascular Disease', risk: 'LOW', probability: 0.15, assessedAt: new Date(Date.now() - 7 * 86400000).toISOString(), factors: ['Sedentary lifestyle', 'Stress'] },
]);
mock(/^\/health-graph-v2\/wearables\/(?!stats)/, () => ({
  heartRate: 72, steps: 8500, sleepHours: 7.2, bloodOxygen: 98,
}));

// ── Health Graph V2 (stats/global) ────────────────────────────────────
mock(/^\/health-graph-v2\/lifestyle\/stats/, () => ({ totalUsers: 8500, trackingActive: 3200, avgSleep: 7.2, avgActivity: 'MODERATE' }));
mock(/^\/health-graph-v2\/symptoms\/stats/, () => ({ totalReports: 12000, commonSymptom: 'Headache', reportingRate: 14 }));
mock(/^\/health-graph-v2\/wearables\/stats/, () => ({ connectedDevices: 2400, dataPointsToday: 450000, avgHeartRate: 72 }));
mock(/^\/health-graph-v2\/risk\/stats/, () => ({ totalAssessments: 5600, highRisk: 420, moderateRisk: 1800, lowRisk: 3380 }));
mock(/^\/health-graph-v2\/prevention\/stats/, () => ({ totalGenerated: 12800, completed: 5400, dismissed: 2800, pending: 4600 }));

// ── Enterprise EHR (stats/global) ─────────────────────────────────────
mock(/^\/ehr\/allergies\/stats/, () => ({ totalAllergies: 245, activeAllergies: 189, criticalAlerts: 3 }));
mock(/^\/ehr\/conditions\/stats/, () => ({ totalConditions: 1890, chronicConditions: 720, acuteConditions: 1170 }));
mock(/^\/ehr\/procedures\/stats/, () => ({ totalProcedures: 560, scheduledProcedures: 120, completedProcedures: 440 }));
mock(/^\/ehr\/immunizations\/stats/, () => ({ totalImmunizations: 3400, dueImmunizations: 280, overdueImmunizations: 45 }));
mock(/^\/ehr\/documents\/stats/, () => ({ totalDocuments: 8900, unsigned: 450, signed: 8450 }));
mock(/^\/ehr\/encounters\/stats/, () => ({ totalEncounters: 3200, todayEncounters: 45, avgDuration: 22 }));
mock(/^\/ehr\/orders\/stats/, () => ({ totalOrders: 1800, pendingOrders: 120, completedOrders: 1680, statOrders: 45 }));
mock(/^\/ehr\/notes\/stats/, () => ({ totalNotes: 5600, unsignedNotes: 340, signedNotes: 5260 }));
mock(/^\/ehr\/cds\/stats/, () => ({ totalAlerts: 890, activeAlerts: 120, dismissedAlerts: 770, criticalAlerts: 8 }));

// ── Enterprise EHR (patient-specific) ────────────────────────────────
mock(/^\/ehr\/allergies\/(?!stats)/, () => [
  { id: 'alg-1', allergen: 'Penicillin', reaction: 'Rash', severity: 'MODERATE', recordedAt: '2025-06-15' },
  { id: 'alg-2', allergen: 'Peanuts', reaction: 'Anaphylaxis', severity: 'SEVERE', recordedAt: '2024-03-10' },
]);
mock(/^\/ehr\/conditions\/(?!stats)/, () => [
  { id: 'cond-1', condition: 'Asthma', status: 'ACTIVE', diagnosedAt: '2020-01-15', notes: 'Well controlled with inhaler' },
]);
mock(/^\/ehr\/procedures\/(?!stats)/, () => [
  { id: 'proc-1', procedure: 'Appendectomy', date: '2023-11-20', surgeon: 'Dr. Amit Verma', outcome: 'Successful' },
]);
mock(/^\/ehr\/immunizations\/(?!stats)/, () => [
  { id: 'imm-1', vaccine: 'COVID-19 Booster', date: '2025-10-01', manufacturer: 'Serum Institute' },
]);
mock(/^\/ehr\/documents\/(?!stats)/, () => [
  { id: 'doc-1', documentType: 'LAB_REPORT', title: 'CBC Report', status: 'SIGNED', createdAt: '2026-05-20' },
]);
mock(/^\/ehr\/encounters\/(?!stats|detail)/, () => [
  { id: 'enc-1', encounterType: 'OUTPATIENT', date: '2026-05-20', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Seasonal allergies', status: 'COMPLETED' },
  { id: 'enc-2', encounterType: 'FOLLOW_UP', date: '2026-06-01', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Follow-up', status: 'SCHEDULED' },
]);
mock(/^\/ehr\/encounters\/detail\//, () => ({
  id: 'enc-1', encounterType: 'OUTPATIENT', date: '2026-05-20', doctor: 'Dr. Rajesh Kumar',
  diagnosis: 'Seasonal allergies', status: 'COMPLETED', notes: 'Patient reported mild seasonal allergies. Prescribed antihistamines.',
}));
mock(/^\/ehr\/orders\/(?!stats|detail)/, () => [
  { id: 'ord-1', orderType: 'LAB', description: 'Complete Blood Count', status: 'COMPLETED', orderedAt: '2026-05-20', orderedBy: 'Dr. Rajesh Kumar' },
]);
mock(/^\/ehr\/orders\/detail\//, () => ({
  id: 'ord-1', orderType: 'LAB', description: 'Complete Blood Count', status: 'COMPLETED',
  orderedAt: '2026-05-20', orderedBy: 'Dr. Rajesh Kumar', results: 'All values within normal range',
}));
mock(/^\/ehr\/notes\/(?!stats|detail)/, () => [
  { id: 'note-1', noteType: 'PROGRESS', content: 'Patient reports improvement in symptoms. BP normal.', author: 'Dr. Rajesh Kumar', signedAt: '2026-05-20', status: 'SIGNED' },
]);
mock(/^\/ehr\/notes\/detail\//, () => ({
  id: 'note-1', noteType: 'PROGRESS', content: 'Patient reports improvement in symptoms. BP normal.',
  author: 'Dr. Rajesh Kumar', signedAt: '2026-05-20', status: 'SIGNED',
}));
mock(/^\/ehr\/cds\/(?!stats)/, () => [
  { id: 'cds-1', alertType: 'DRUG_INTERACTION', severity: 'HIGH', message: 'Potential interaction between Warfarin and Aspirin', triggeredAt: '2026-05-20', status: 'ACTIVE' },
]);

// ── EHR Timeline ──────────────────────────────────────────────────────
mock(/^\/ehr\/timeline\//, () => [
  { id: 'et-1', type: 'ENCOUNTER', title: 'Office Visit', date: '2026-05-20', provider: 'Dr. Rajesh Kumar' },
  { id: 'et-2', type: 'LAB_RESULT', title: 'CBC Results', date: '2026-05-21', provider: 'Thyrocare' },
]);
mock(/^\/ehr\/timeline$/, () => ({
  entries: [
    { id: 'et-1', type: 'ENCOUNTER', title: 'Office Visit', date: '2026-05-20', provider: 'Dr. Rajesh Kumar' },
  ],
}));

// ── ABDM ──────────────────────────────────────────────────────────────
mock(/^\/abdm\/abha\/stats/, () => ({ totalLinked: 12450, activeToday: 340, pendingLinking: 230 }));
mock(/^\/abdm\/abha\/search/, () => [
  { abhaAddress: 'ananya@abdm', fullName: 'Ananya Sharma', status: 'VERIFIED' },
]);
mock(/^\/abdm\/abha\/profile\//, () => ({
  abhaAddress: 'ananya@abdm', fullName: 'Ananya Sharma', healthIdNumber: '91-2345-6789',
  status: 'LINKED', linkedAt: '2025-01-15',
}));
mock(/^\/abdm\/consent\/stats/, () => ({ totalConsents: 5200, activeConsents: 3800, revokedConsents: 1400 }));
mock(/^\/abdm\/consent\/patient\//, () => [
  { id: 'ab-con-1', purpose: 'Treatment', status: 'ACTIVE', grantedAt: '2026-01-10' },
]);
mock(/^\/abdm\/consent$/, () => [
  { id: 'ab-con-1', purpose: 'Treatment', status: 'ACTIVE', grantedAt: '2026-01-10' },
]);
mock(/^\/abdm\/consent\/[^/]+$/, () => ({
  id: 'ab-con-1', purpose: 'Treatment', status: 'ACTIVE', grantedAt: '2026-01-10',
}));
mock(/^\/abdm\/gateway\/health/, () => ({ status: 'OPERATIONAL', uptime: '99.92%', lastIncident: '2026-04-15' }));
mock(/^\/abdm\/hpr\/stats/, () => ({ totalDoctors: 4500, verifiedDoctors: 4200, unverifiedDoctors: 300 }));
mock(/^\/abdm\/hpr\/search/, () => [
  { hprId: 'hpr-1', name: 'Dr. Rajesh Kumar', specialization: 'General Physician', verified: true },
]);
mock(/^\/abdm\/hfr\/stats/, () => ({ totalFacilities: 2800, activeFacilities: 2600, inactiveFacilities: 200 }));
mock(/^\/abdm\/hfr\/search/, () => [
  { hfrId: 'hfr-1', name: 'City Hospital', type: 'HOSPITAL', city: 'Mumbai', active: true },
]);
mock(/^\/abdm\/hip\/care-contexts\//, () => [
  { id: 'cc-1', displayName: 'Primary Care', type: 'Outpatient' },
]);

// ── NHCX ──────────────────────────────────────────────────────────────
mock(/^\/nhcx\/stats/, () => ({ totalSubmissions: 1250, successRate: 94.5, pending: 85, failed: 12, avgProcessingTime: '4.2h' }));
mock(/^\/nhcx\/submissions\/[^/]+\/sync/, () => ({
  submissionId: 'nhcx-1', status: 'ACKNOWLEDGED', updatedAt: new Date().toISOString(),
}));
mock(/^\/nhcx\/submissions/, () => [
  { id: 'nhcx-1', claimRef: 'CL-2026-001', insurer: 'Star Health', amount: 45000, status: 'SUBMITTED', submittedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'nhcx-2', claimRef: 'CL-2026-002', insurer: 'HDFC ERGO', amount: 120000, status: 'ACKNOWLEDGED', submittedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
]);
mock(/^\/nhcx\/providers\/[^/]+\/configuration/, () => ({
  providerId: 'ip-1', insurerId: 'STAR_HEALTH', apiEndpoint: 'https://api.nhcx.gov.in/staging',
  connected: true, lastSyncAt: new Date().toISOString(),
}));

// ── Provider Graph ────────────────────────────────────────────────────
mock(/^\/provider-graph\/stats/, () => ({ totalProviders: 3200, totalReferrals: 1800, avgScore: 4.3 }));
mock(/^\/provider-graph\/nodes\/[^/]+$/, () => ({
  id: 'node-1', name: 'Dr. Rajesh Kumar', type: 'DOCTOR', specialization: 'General Physician', score: 4.8,
}));
mock(/^\/provider-graph\/search/, () => [
  { id: 'node-1', name: 'Dr. Rajesh Kumar', type: 'DOCTOR', score: 4.8 },
  { id: 'node-2', name: 'Dr. Sneha Patel', type: 'DOCTOR', score: 4.7 },
]);
mock(/^\/provider-graph\/referrals\/[^/]+\/respond/, () => ({
  id: 'ref-1', status: 'ACCEPTED',
}));
mock(/^\/provider-graph\/referrals\/[^/]+\/complete/, () => ({
  id: 'ref-1', status: 'COMPLETED',
}));
mock(/^\/provider-graph\/referrals\/[^/]+$/, () => ({
  id: 'ref-1', fromNodeId: 'node-2', toNodeId: 'node-1', status: 'ACCEPTED', notes: '',
}));
mock(/^\/provider-graph\/referrals/, () => [
  { id: 'ref-1', fromNodeId: 'node-2', toNodeId: 'node-1', status: 'ACCEPTED', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'ref-2', fromNodeId: 'node-1', toNodeId: 'node-3', status: 'PENDING', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
]);
mock(/^\/provider-graph\/referrals\/stats/, () => ({ total: 1800, pending: 340, accepted: 1200, completed: 960, declined: 260 }));
mock(/^\/provider-graph\/reputation\/top/, () => [
  { id: 'pg-1', name: 'Dr. Rajesh Kumar', specialization: 'General Physician', score: 4.8, referralCount: 240 },
  { id: 'pg-2', name: 'Dr. Sneha Patel', specialization: 'Cardiologist', score: 4.7, referralCount: 180 },
  { id: 'pg-3', name: 'Dr. Amit Verma', specialization: 'Orthopedic', score: 4.5, referralCount: 150 },
]);

// ── Health / graph ────────────────────────────────────────────────────
mock(/^\/health\/graph/, () => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    { label: 'Health Score', data: [72, 75, 78, 80, 82, 85] },
  ],
}));
mock(/^\/health\/timeline/, () => [
  { id: 'ht-1', type: 'CHECKUP', title: 'Quarterly Checkup', date: '2026-04-15' },
  { id: 'ht-2', type: 'LAB', title: 'Blood Work', date: '2026-05-01' },
]);

// ── Vault download URL ────────────────────────────────────────────────
mock(/^\/vault\/records\/[^/]+\/download-url/, () => ({
  url: 'https://storage.example.com/records/rec-1.pdf?token=mock-token',
  expiresIn: 3600,
}));

// ── Clinic billing ────────────────────────────────────────────────────
mock(/^\/clinic\/invoices\/[^/]+\/payments/, () => ({ success: true, transactionId: 'txn-001' }));
mock(/^\/clinic\/invoices\/[^/]+\/adjustments/, () => ({
  id: 'inv-1', totalAmount: 4500, adjustments: [{ amount: -200 }],
}));
mock(/^\/clinic\/invoices\/[^/]+\/refunds/, () => ({ success: true, refundId: 'refund-001' }));
mock(/^\/clinic\/invoices\/[^/]+\/settle/, () => ({
  id: 'inv-1', totalAmount: 4500, status: 'SETTLED',
}));
mock(/^\/clinic\/invoices\/[^/]+$/, () => ({
  id: 'inv-1', invoiceNumber: 'INV-2026-001', totalAmount: 4500, status: 'PAID', patientUserId: 'user-1',
}));
mock(/^\/clinic\/invoices/, () => [
  { id: 'inv-1', invoiceNumber: 'INV-2026-001', totalAmount: 4500, status: 'PAID', patientUserId: 'user-1', createdAt: '2026-05-20' },
  { id: 'inv-2', invoiceNumber: 'INV-2026-002', totalAmount: 12000, status: 'PENDING', patientUserId: 'user-1', createdAt: '2026-06-01' },
]);
mock(/^\/clinic\/queue\//, () => [
  { id: 'q-1', patientName: 'Ananya Sharma', status: 'WAITING', priority: 'NORMAL', checkInAt: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'q-2', patientName: 'Rahul Verma', status: 'IN_CONSULTATION', priority: 'HIGH', checkInAt: new Date(Date.now() - 60 * 60000).toISOString() },
]);

export function getMockResponse(path: string, _options?: { method?: string; body?: unknown }): { data: any } | null {
  const factory = findMock(path);
  if (factory) {
    return { data: factory() };
  }
  return null;
}
