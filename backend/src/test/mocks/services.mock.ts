import { mock } from 'node:test';

export function makeAuditMock() {
  return {
    capture: mock.fn<(...args: any[]) => any>(async () => {}),
  };
}

export function makeJwtMock(payload?: Record<string, unknown>) {
  return {
    signAsync: mock.fn<(...args: any[]) => any>(async () => 'signed.jwt.token'),
    verifyAsync: mock.fn<(...args: any[]) => any>(async () =>
      payload ?? {
        sub: 'user-a',
        phoneNumber: '+910000000001',
        roles: ['PATIENT'],
        sessionId: 'session-1',
        jti: 'test-jti',
      },
    ),
    sign: mock.fn<(...args: any[]) => any>(() => 'signed.jwt.token'),
    verify: mock.fn<(...args: any[]) => any>(() => ({ sub: 'user-a' })),
    decode: mock.fn<(...args: any[]) => any>(() => ({ sub: 'user-a' })),
  };
}

export function makeSmsMock() {
  return {
    sendOtp: mock.fn<(...args: any[]) => any>(async () => ({ success: true })),
    sendNotification: mock.fn<(...args: any[]) => any>(async () => ({ success: true })),
    send: mock.fn<(...args: any[]) => any>(async () => ({ success: true })),
  };
}

export function makeFcmMock() {
  return {
    sendPush: mock.fn<(...args: any[]) => any>(async () => ({ success: true })),
    sendMulticast: mock.fn<(...args: any[]) => any>(async () => ({ successCount: 1, failureCount: 0 })),
    sendToTopic: mock.fn<(...args: any[]) => any>(async () => ({})),
    subscribeToTopic: mock.fn<(...args: any[]) => any>(async () => ({})),
    unsubscribeFromTopic: mock.fn<(...args: any[]) => any>(async () => ({})),
    isAvailable: mock.fn<(...args: any[]) => any>(() => false),
  };
}

export function makeEventsMock() {
  return {
    publish: mock.fn<(...args: any[]) => any>(async () => {}),
    emit: mock.fn<(...args: any[]) => any>(async () => {}),
    subscribe: mock.fn<(...args: any[]) => any>(() => {}),
  };
}

export function makeGatewayMock() {
  return {
    emitUserNotification: mock.fn<(...args: any[]) => any>(() => {}),
    sendToUser: mock.fn<(...args: any[]) => any>(() => {}),
    sendToRoom: mock.fn<(...args: any[]) => any>(() => {}),
    handleConnection: mock.fn<(...args: any[]) => any>(() => {}),
    handleDisconnect: mock.fn<(...args: any[]) => any>(() => {}),
  };
}

export function makeStorageMock() {
  return {
    buildObjectKey: mock.fn<(...args: any[]) => any>((_userId: string, name: string) => `uploads/${name}`),
    saveObject: mock.fn<(...args: any[]) => any>(async () => ({ key: 'mock-key', etag: 'etag' })),
    loadObject: mock.fn<(...args: any[]) => any>(async () => Buffer.from('mock-data')),
    deleteObject: mock.fn<(...args: any[]) => any>(async () => {}),
    getDownloadUrl: mock.fn<(...args: any[]) => any>(async () => 'https://storage.example.com/signed-url'),
    assertValidDownload: mock.fn<(...args: any[]) => any>(() => {}),
    scanObject: mock.fn<(...args: any[]) => any>(async () => ({ safe: true })),
    listObjects: mock.fn<(...args: any[]) => any>(async () => []),
    copyObject: mock.fn<(...args: any[]) => any>(async () => {}),
  };
}

export function makeEncryptionMock() {
  return {
    encrypt: mock.fn<(...args: any[]) => any>((plaintext: string) => `enc:${plaintext}`),
    decrypt: mock.fn<(...args: any[]) => any>((ciphertext: string) => {
      if (ciphertext.startsWith('enc:')) return ciphertext.slice(4);
      return 'decrypted';
    }),
    encryptBuffer: mock.fn<(...args: any[]) => any>(() => ({
      iv: Buffer.from('iv'),
      authTag: Buffer.from('tag'),
      ciphertext: Buffer.from('ciphertext'),
    })),
    decryptBuffer: mock.fn<(...args: any[]) => any>(() => Buffer.from('decrypted-buffer')),
    hash: mock.fn<(...args: any[]) => any>((data: string) => `hashed:${data}`),
  };
}

export function makeWyshIdMock() {
  return {
    generateWyshId: mock.fn<(...args: any[]) => any>(() => 'WYSH-TEST-00000001'),
    generatePatientId: mock.fn<(...args: any[]) => any>(() => 'WYSH-PAT-00000001'),
    generateDoctorId: mock.fn<(...args: any[]) => any>(() => 'WYSH-DOC-00000001'),
    validateWyshId: mock.fn<(...args: any[]) => any>((id: string) => /^WYSH-/.test(id)),
  };
}

export function makeMfaMock() {
  return {
    generateSecret: mock.fn<(...args: any[]) => any>((email: string) => ({
      secret: 'JBSWY3DPEHPK3PXP',
      otpauthUrl: `otpauth://totp/WyshCare:${email}?secret=JBSWY3DPEHPK3PXP`,
    })),
    verifyToken: mock.fn<(...args: any[]) => any>((_secret: string, token: string) => token === '123456'),
    generateBackupCodes: mock.fn<(...args: any[]) => any>(() => {
      const { createHash } = require('node:crypto');
      return {
        hashed: Array.from({ length: 8 }, (_, i) => createHash('sha256').update(`CODE00${i + 1}`).digest('hex')),
        plain: ['CODE001', 'CODE002', 'CODE003', 'CODE004', 'CODE005', 'CODE006', 'CODE007', 'CODE008'],
      };
    }),
    verifyBackupCode: mock.fn<(...args: any[]) => any>((code: string, hashedJson: string) => {
      const { createHash } = require('node:crypto');
      const hashed = JSON.parse(hashedJson);
      const codeHash = createHash('sha256').update(code).digest('hex');
      return hashed.includes(codeHash) ? codeHash : null;
    }),
    removeUsedBackupCode: mock.fn<(...args: any[]) => any>((usedCode: string, hashedJson: string) => {
      const hashed = JSON.parse(hashedJson) as string[];
      return JSON.stringify(hashed.filter((h: string) => h !== usedCode));
    }),
    generateQrCodeDataUrl: mock.fn<(...args: any[]) => any>(async () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...'),
  };
}

export function makeSupabaseMock() {
  return {
    isAvailable: mock.fn<(...args: any[]) => any>(() => false),
    sendOtp: mock.fn<(...args: any[]) => any>(async () => ({ success: false, error: 'Supabase not configured' })),
    verifyOtp: mock.fn<(...args: any[]) => any>(async () => ({ success: false, error: 'Supabase not configured' })),
    getClient: mock.fn<(...args: any[]) => any>(() => ({
      auth: {
        signInWithOtp: async () => ({ data: null, error: null }),
        verifyOtp: async () => ({ data: null, error: null }),
      },
    })),
  };
}

export function makeDeviceTokensMock() {
  return {
    registerToken: mock.fn<(...args: any[]) => any>(async () => ({ id: 'dt-1' })),
    unregisterToken: mock.fn<(...args: any[]) => any>(async () => {}),
    getTokensForUser: mock.fn<(...args: any[]) => any>(async () => ['fcm-token-1', 'fcm-token-2']),
    getUserIdsForToken: mock.fn<(...args: any[]) => any>(async () => ['user-1']),
  };
}

export function makeAiMock() {
  return {
    chat: mock.fn<(...args: any[]) => any>(async () => 'Mock AI response'),
    generateContent: mock.fn<(...args: any[]) => any>(async () => 'Mock content'),
    streamChat: mock.fn<(...args: any[]) => any>(async () => (async function* () {})()),
    analyze: mock.fn<(...args: any[]) => any>(async () => ({ risk: 'low', score: 0.1 })),
    summarizeHealthcareText: mock.fn<(...args: any[]) => any>(async () =>
      JSON.stringify({ subjective: 'Mock', objective: 'Mock', assessment: 'Mock', plan: 'Mock' }),
    ),
    explainRecord: mock.fn<(...args: any[]) => any>(async () => ({
      recordId: 'rec-1',
      explanation: 'Mock explanation',
      source: 'ai',
    })),
  };
}

export function makeThrottlerMock() {
  return {
    increment: mock.fn<(...args: any[]) => any>(async () => ({
      totalHits: 0,
      timeToExpire: 60000,
      isBlocked: false,
      timeToBlockExpire: 0,
    })),
  };
}

export function makeLivekitMock() {
  return {
    createParticipantToken: mock.fn<(...args: any[]) => any>(() => 'mock-livekit-token'),
    createRoom: mock.fn<(...args: any[]) => any>(async () => ({ name: 'mock-room' })),
    deleteRoom: mock.fn<(...args: any[]) => any>(async () => {}),
  };
}

export function makeRazorpayMock() {
  return {
    createPaymentOrder: mock.fn<(...args: any[]) => any>(async () => ({ id: 'order_mock', amount: 100, currency: 'INR' })),
    verifyPayment: mock.fn<(...args: any[]) => any>(async () => true),
    refundPayment: mock.fn<(...args: any[]) => any>(async () => ({ id: 'rfnd_mock' })),
  };
}

export function makeConfigMock(overrides: Record<string, any> = {}) {
  const store: Record<string, any> = {
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    MASTER_ENCRYPTION_KEY: 'adbe6a2dc943ecc3c9acd80655276507984379c05c18643f9bc9fde2164403e2',
    ...overrides,
  };
  return {
    get: mock.fn<(...args: any[]) => any>((key: string, fallback?: any) => store[key] ?? fallback),
    getOrThrow: mock.fn<(...args: any[]) => any>((key: string) => {
      if (!(key in store)) throw new Error(`Missing config: ${key}`);
      return store[key];
    }),
  };
}
