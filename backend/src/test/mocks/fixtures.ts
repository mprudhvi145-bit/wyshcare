import { createHash } from 'node:crypto';

export function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-a',
    wyshId: 'WYSH-00000001',
    phoneNumber: '+910000000001',
    fullName: 'Test User',
    email: null,
    gender: null,
    dateOfBirth: null,
    bloodGroup: null,
    aadhaarLast4: null,
    abhaAddress: null,
    preferredLanguage: 'en',
    isPhoneVerified: true,
    isMfaEnabled: false,
    mfaSecret: null,
    backupCodes: null,
    status: 'PENDING',
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    lastSeenAt: null,
    chronicConditions: [],
    allergiesSummary: [],
    roles: [{ role: 'PATIENT' }],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

export function makeChallenge(overrides: Record<string, unknown> = {}) {
  return {
    id: 'challenge-1',
    phoneNumber: '+910000000001',
    otpHash: createHash('sha256').update('123456').digest('hex'),
    purpose: 'LOGIN',
    channel: 'SMS',
    attemptCount: 0,
    verifiedAt: null,
    expiresAt: new Date(Date.now() + 10 * 60_000),
    createdAt: new Date(),
    ...overrides,
  };
}

export function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'record-1',
    userId: 'user-a',
    recordType: 'DIAGNOSTIC_REPORT',
    title: 'Blood Test',
    source: 'MANUAL_UPLOAD',
    storageKey: 'user-a/blood-test.json',
    description: null,
    mimeType: null,
    fileSize: null,
    extractedText: null,
    hash: null,
    version: 1,
    recordedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

export function makeConsent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'consent-1',
    ownerUserId: 'user-a',
    grantedToUserId: 'user-b',
    accessLevel: 'LIMITED',
    accessMethod: 'MANUAL_APPROVAL',
    status: 'ACTIVE',
    purpose: 'Second opinion',
    scope: {},
    expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
    grantedAt: new Date(),
    revokedAt: null,
    createdAt: new Date(),
    grantedToUser: { fullName: 'Doctor B' },
    shareLinks: [],
    ...overrides,
  };
}

export function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'session-1',
    userId: 'user-a',
    deviceId: 'device-1',
    deviceInfo: 'Test Device',
    ipAddress: '127.0.0.1',
    refreshToken: 'rt-mock-token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function makeNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: 'notif-1',
    userId: 'user-a',
    channel: 'IN_APP',
    priority: 'NORMAL',
    status: 'PENDING',
    title: 'Test Notification',
    body: 'This is a test notification',
    data: {},
    readAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}
