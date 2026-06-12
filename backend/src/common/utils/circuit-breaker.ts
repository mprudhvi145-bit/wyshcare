/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/utils/circuit-breaker.ts
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
 * circuit-breaker — WyshID module
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

export class CircuitBreakerOpenError extends Error {
  constructor(
    public readonly circuitName: string,
    public readonly retryAfterMs: number,
  ) {
    super(`Circuit ${circuitName} is OPEN — retry after ${retryAfterMs}ms`);
    this.name = 'CircuitBreakerOpenError';
  }
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
  halfOpenMaxRequests: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 30_000,
  halfOpenMaxRequests: 3,
};

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitStateData {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureAt: number | null;
  lastStateChangeAt: number;
}

export class CircuitBreaker {
  private readonly circuits = new Map<string, CircuitStateData>();
  private readonly options: CircuitBreakerOptions;

  constructor(options?: Partial<CircuitBreakerOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async call<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const circuit = this.getOrInit(name);

    if (circuit.state === 'OPEN') {
      const elapsed = Date.now() - circuit.lastStateChangeAt;
      if (elapsed < this.options.timeoutMs) {
        throw new CircuitBreakerOpenError(name, this.options.timeoutMs - elapsed);
      }
      circuit.state = 'HALF_OPEN';
      circuit.lastStateChangeAt = Date.now();
    }

    try {
      const result = await fn();
      this.onSuccess(name);
      return result;
    } catch (err) {
      this.onFailure(name);
      throw err;
    }
  }

  getState(name: string): CircuitState {
    return this.circuits.get(name)?.state ?? 'CLOSED';
  }

  getStats(name: string) {
    const circuit = this.circuits.get(name);
    if (!circuit) {
      return { state: 'CLOSED' as CircuitState, failures: 0, successes: 0 };
    }
    return {
      state: circuit.state,
      failures: circuit.failures,
      successes: circuit.successes,
    };
  }

  private getOrInit(name: string): CircuitStateData {
    let circuit = this.circuits.get(name);
    if (!circuit) {
      circuit = { state: 'CLOSED', failures: 0, successes: 0, lastFailureAt: null, lastStateChangeAt: Date.now() };
      this.circuits.set(name, circuit);
    }
    return circuit;
  }

  private onSuccess(name: string) {
    const circuit = this.circuits.get(name);
    if (!circuit) return;

    if (circuit.state === 'HALF_OPEN') {
      circuit.successes += 1;
      if (circuit.successes >= this.options.successThreshold) {
        circuit.state = 'CLOSED';
        circuit.failures = 0;
        circuit.successes = 0;
        circuit.lastStateChangeAt = Date.now();
      }
    } else {
      circuit.failures = 0;
    }
  }

  private onFailure(name: string) {
    const circuit = this.circuits.get(name);
    if (!circuit) return;

    circuit.failures += 1;
    circuit.lastFailureAt = Date.now();

    if (circuit.state === 'HALF_OPEN' || circuit.failures >= this.options.failureThreshold) {
      circuit.state = 'OPEN';
      circuit.lastStateChangeAt = Date.now();
    }
  }
}

export const globalCircuitBreaker = new CircuitBreaker();
