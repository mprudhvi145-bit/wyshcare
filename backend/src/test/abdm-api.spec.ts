import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { AbdmApiService } from '../modules/abdm/abdm-api.service';
import { ConfigService } from '@nestjs/config';

const ORIGINAL_CLIENT_ID = process.env.ABDM_CLIENT_ID;
const ORIGINAL_CLIENT_SECRET = process.env.ABDM_CLIENT_SECRET;

describe('AbdmApiService - availability checks', () => {
  after(() => {
    process.env.ABDM_CLIENT_ID = ORIGINAL_CLIENT_ID;
    process.env.ABDM_CLIENT_SECRET = ORIGINAL_CLIENT_SECRET;
  });

  it('reports unavailable when no credentials configured', () => {
    delete process.env.ABDM_CLIENT_ID;
    delete process.env.ABDM_CLIENT_SECRET;
    const service = new AbdmApiService(new ConfigService());
    assert.equal(service.isAvailable(), false);
  });

  it('reports available when credentials configured', () => {
    process.env.ABDM_CLIENT_ID = 'test-client';
    process.env.ABDM_CLIENT_SECRET = 'test-secret';
    const service = new AbdmApiService(new ConfigService());
    assert.equal(service.isAvailable(), true);
  });
});
