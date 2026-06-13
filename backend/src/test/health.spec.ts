import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

const mockQueryRaw = mock.fn<(...args: any[]) => any>();
const mockHealthcheck = mock.fn<(...args: any[]) => any>();

describe('HealthController', () => {
  describe('GET /health/live', () => {
    it('returns status ok with timestamp', async () => {
      const { HealthController } = await import('../modules/health/health.controller');
      const prisma = { $queryRaw: mockQueryRaw } as any;
      const redis = { healthcheck: mockHealthcheck } as any;
      const ctrl = new HealthController(prisma, redis);
      const result = ctrl.getLive() as any;
      assert.equal(result.status, 'ok');
      assert.ok(result.timestamp);
    });
  });

  describe('GET /health/ready', () => {
    it('returns ok when both DB and Redis are healthy', async () => {
      const { HealthController } = await import('../modules/health/health.controller');
      mockQueryRaw.mock.mockImplementation(async () => []);
      mockHealthcheck.mock.mockImplementation(async () => ({ status: 'ok' }));
      const prisma = { $queryRaw: mockQueryRaw } as any;
      const redis = { healthcheck: mockHealthcheck } as any;
      const ctrl = new HealthController(prisma, redis);
      const result = await ctrl.getReady() as any;
      assert.equal(result.status, 'ok');
      assert.equal(result.checks.database, 'ok');
      assert.equal(result.checks.redis, 'ok');
    });

    it('returns degraded when DB fails', async () => {
      const { HealthController } = await import('../modules/health/health.controller');
      mockQueryRaw.mock.mockImplementation(async () => { throw new Error('DB down'); });
      mockHealthcheck.mock.mockImplementation(async () => ({ status: 'ok' }));
      const prisma = { $queryRaw: mockQueryRaw } as any;
      const redis = { healthcheck: mockHealthcheck } as any;
      const ctrl = new HealthController(prisma, redis);
      const result = await ctrl.getReady() as any;
      assert.equal(result.status, 'degraded');
      assert.equal(result.checks.database, 'error');
    });

    it('returns degraded when Redis fails', async () => {
      const { HealthController } = await import('../modules/health/health.controller');
      mockQueryRaw.mock.mockImplementation(async () => []);
      mockHealthcheck.mock.mockImplementation(async () => { throw new Error('Redis down'); });
      const prisma = { $queryRaw: mockQueryRaw } as any;
      const redis = { healthcheck: mockHealthcheck } as any;
      const ctrl = new HealthController(prisma, redis);
      const result = await ctrl.getReady() as any;
      assert.equal(result.status, 'degraded');
      assert.equal(result.checks.redis, 'error');
    });

    it('returns degraded when both fail', async () => {
      const { HealthController } = await import('../modules/health/health.controller');
      mockQueryRaw.mock.mockImplementation(async () => { throw new Error('DB down'); });
      mockHealthcheck.mock.mockImplementation(async () => { throw new Error('Redis down'); });
      const prisma = { $queryRaw: mockQueryRaw } as any;
      const redis = { healthcheck: mockHealthcheck } as any;
      const ctrl = new HealthController(prisma, redis);
      const result = await ctrl.getReady() as any;
      assert.equal(result.status, 'degraded');
      assert.equal(result.checks.database, 'error');
      assert.equal(result.checks.redis, 'error');
    });
  });
});

describe('Root HealthController (src/health.controller.ts)', () => {
  it('GET /health returns status with dependencies', async () => {
    const mockPrisma = { $queryRaw: mock.fn(async () => []) };
    const mockRedis = { healthcheck: mock.fn(async () => ({ status: 'ok' })) };
    const { HealthController: RootHealth } = await import('../health.controller');
    const ctrl = new RootHealth(mockPrisma as any, mockRedis as any);
    const result = await ctrl.status() as any;
    assert.equal(result.status, 'ok');
    assert.equal(result.service, 'wyshcare-backend');
    assert.ok(result.dependencies);
    assert.ok(result.timestamp);
  });
});
