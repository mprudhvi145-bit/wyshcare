import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const originalEnv = { ...process.env };

describe('SupabaseService - availability checks', () => {
  after(() => {
    process.env = { ...originalEnv };
  });

  it('reports unavailable when SUPABASE_URL and SUPABASE_ANON_KEY not set', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    const { SupabaseService } = require('../providers/supabase/supabase.service');
    const service = new SupabaseService();
    assert.equal(service.isAvailable(), false);
  });

  it('reports unavailable when only URL set but not anon key', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_ANON_KEY;
    const { SupabaseService } = require('../providers/supabase/supabase.service');
    const service = new SupabaseService();
    assert.equal(service.isAvailable(), false);
  });

  it('reports available when both URL and anon key are set', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
    const { SupabaseService } = require('../providers/supabase/supabase.service');
    const service = new SupabaseService();
    assert.equal(service.isAvailable(), true);
  });

  it('sendOtp returns false when not configured', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    const { SupabaseService } = require('../providers/supabase/supabase.service');
    const service = new SupabaseService();
    const result = await service.sendOtp('+911234567890');
    assert.equal(result.success, false);
  });

  it('verifyOtp returns false when not configured', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    const { SupabaseService } = require('../providers/supabase/supabase.service');
    const service = new SupabaseService();
    const result = await service.verifyOtp('+911234567890', '123456');
    assert.equal(result.success, false);
    assert.equal(result.error, 'Supabase not configured');
  });
});
