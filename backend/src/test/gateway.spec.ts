import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const originalEnv = { ...process.env };

describe('GatewayService - mock methods', () => {
  after(() => {
    process.env = { ...originalEnv };
  });

  it('healthCheck returns operational status', () => {
    const { ConfigService } = require('@nestjs/config');
    const { GatewayService } = require('../modules/abdm/gateway.service');
    const service = new GatewayService(new ConfigService());
    const result = service.healthCheck();
    assert.equal(result.status, 'OPERATIONAL');
    assert.ok(result.lastSync);
    assert.ok(result.gateway);
  });

  it('abhaCreate returns a generated ABHA number', async () => {
    const { ConfigService } = require('@nestjs/config');
    const { GatewayService } = require('../modules/abdm/gateway.service');
    const service = new GatewayService(new ConfigService());
    const result = await service.abhaCreate({ name: 'Test User', gender: 'M', dateOfBirth: '1990-01-01', phone: '+911234567890' });
    assert.equal(result.success, true);
    assert.ok(result.txnId);
    assert.ok(result.abhaNumber);
    assert.ok(result.abhaAddress);
  });

  it('hprSearch returns results', async () => {
    const { ConfigService } = require('@nestjs/config');
    const { GatewayService } = require('../modules/abdm/gateway.service');
    const service = new GatewayService(new ConfigService());
    const result = await service.hprSearch('Dr. Test');
    assert.equal(result.success, true);
    assert.ok(Array.isArray(result.results));
    assert.ok(result.results.length > 0);
  });

  it('hfrSearch returns results', async () => {
    const { ConfigService } = require('@nestjs/config');
    const { GatewayService } = require('../modules/abdm/gateway.service');
    const service = new GatewayService(new ConfigService());
    const result = await service.hfrSearch('Test Hospital');
    assert.equal(result.success, true);
    assert.ok(Array.isArray(result.results));
    assert.ok(result.results.length > 0);
  });
});
