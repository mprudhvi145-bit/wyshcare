import 'reflect-metadata';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

describe('MetricsController', () => {
  describe('GET /metrics', () => {
    it('returns Prometheus-formatted text', async () => {
      const { MetricsController } = await import('../modules/metrics/metrics.controller');
      const ctrl = new MetricsController();
      const output = ctrl.getMetrics();
      assert.ok(output.includes('wyshcare_uptime_seconds'));
      assert.ok(output.includes('wyshcare_http_requests_total'));
      assert.ok(output.includes('wyshcare_http_errors_total'));
      assert.ok(output.includes('wyshcare_start_time_seconds'));
      assert.ok(output.includes('wyshcare_db_connections'));
      assert.ok(output.includes('wyshcare_info'));
      assert.ok(output.includes('version="1.0.0"'));
      assert.ok(output.includes('# HELP'));
      assert.ok(output.includes('# TYPE'));
    });

    it('request count starts at 0', async () => {
      const { MetricsController } = await import('../modules/metrics/metrics.controller');
      const ctrl = new MetricsController();
      const output = ctrl.getMetrics();
      assert.ok(output.includes('wyshcare_http_requests_total 0'));
      assert.ok(output.includes('wyshcare_http_errors_total 0'));
    });

    it('exposes environment info', async () => {
      const { MetricsController } = await import('../modules/metrics/metrics.controller');
      const ctrl = new MetricsController();
      const output = ctrl.getMetrics();
      assert.ok(output.includes('environment="'));
    });

    it('uptime is a non-negative number', async () => {
      const { MetricsController } = await import('../modules/metrics/metrics.controller');
      const ctrl = new MetricsController();
      const output = ctrl.getMetrics();
      const match = output.match(/wyshcare_uptime_seconds (\d+)/);
      assert.ok(match, 'uptime metric not found');
      assert.ok(Number(match[1]) >= 0);
    });
  });

  describe('incrementRequests / incrementErrors', () => {
    it('incrementRequests increases request count', async () => {
      const { MetricsController } = await import('../modules/metrics/metrics.controller');
      const ctrl = new MetricsController();
      ctrl.incrementRequests();
      ctrl.incrementRequests();
      ctrl.incrementRequests();
      const output = ctrl.getMetrics();
      assert.ok(output.includes('wyshcare_http_requests_total 3'));
    });

    it('incrementErrors increases error count', async () => {
      const { MetricsController } = await import('../modules/metrics/metrics.controller');
      const ctrl = new MetricsController();
      ctrl.incrementErrors();
      ctrl.incrementErrors();
      const output = ctrl.getMetrics();
      assert.ok(output.includes('wyshcare_http_errors_total 2'));
    });

    it('counters increment independently', async () => {
      const { MetricsController } = await import('../modules/metrics/metrics.controller');
      const ctrl = new MetricsController();
      ctrl.incrementRequests();
      ctrl.incrementErrors();
      ctrl.incrementRequests();
      const output = ctrl.getMetrics();
      assert.ok(output.includes('wyshcare_http_requests_total 2'));
      assert.ok(output.includes('wyshcare_http_errors_total 1'));
    });
  });

  describe('content-type header', () => {
    it('@Header sets text/plain content type', async () => {
      const { MetricsController } = await import('../modules/metrics/metrics.controller');
      const metadata = Reflect.getMetadata('__headers__', MetricsController.prototype.getMetrics);
      assert.ok(metadata);
      const ct = metadata.find((h: any) => h.name === 'content-type');
      assert.ok(ct);
      assert.equal(ct.value, 'text/plain; charset=utf-8');
    });
  });
});
