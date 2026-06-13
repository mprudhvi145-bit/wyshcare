import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const originalEnv = { ...process.env };

describe('AiIntelligenceService - explainRecord', () => {
  after(() => {
    process.env = { ...originalEnv };
  });

  it('returns empty explanation when no record content available', () => {
    const { AiIntelligenceService } = require('../modules/ai/services/ai-intelligence.service');

    const mockPrisma = {
      healthRecord: {
        findFirst: async () => ({
          id: 'rec-1',
          recordType: 'PRESCRIPTION',
          extractedText: null,
          structuredPayload: null,
          diagnostics: [],
          medications: [],
        }),
      },
    };

    const mockOrchestrator = { chat: async () => ({ content: '' }) };
    const mockGraph = { getPatientGraph: async () => ({ nodes: [], edges: [] }) };

    const service = new AiIntelligenceService(mockPrisma as any, mockOrchestrator as any, mockGraph as any);

    service.explainRecord('user-1', 'rec-1').then((result: any) => {
      assert.equal(result.recordId, 'rec-1');
      assert.equal(result.explanation, 'No content available for analysis.');
      assert.equal(result.source, 'empty');
    });
  });

  it('throws NotFoundException for missing record', async () => {
    const { AiIntelligenceService } = require('../modules/ai/services/ai-intelligence.service');
    const { NotFoundException } = require('@nestjs/common');

    const mockPrisma = {
      healthRecord: {
        findFirst: async () => null,
      },
    };

    const mockOrchestrator = { chat: async () => ({ content: '' }) };
    const mockGraph = { getPatientGraph: async () => ({ nodes: [], edges: [] }) };

    const service = new AiIntelligenceService(mockPrisma as any, mockOrchestrator as any, mockGraph as any);

    try {
      await service.explainRecord('user-1', 'nonexistent');
      assert.fail('Should have thrown');
    } catch (err) {
      assert(err instanceof NotFoundException);
    }
  });
});
