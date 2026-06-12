# In-Memory Trust Boundary Review

**Status:** Validated
**Last Reviewed:** 2026-05-13

## 1. Objective

This document analyzes the application for risks of in-memory data leakage, where authenticated context or sensitive data from one user could potentially contaminate the session of another. This is distinct from database-level RLS and focuses on the application runtime.

## 2. Analysis of Current Architecture

The backend is built on Express.js, and its request-handling model provides a strong foundation for isolation.

*   **Request-Scoped Execution:** Express middleware and route handlers are invoked once per incoming HTTP request. Local variables and objects created within a handler are garbage-collected after the response is sent, preventing cross-request contamination.
*   **Stateless Services:** The services (e.g., `audit-log.service.js`) are designed as collections of exported functions. They do not maintain their own internal state across requests. They operate only on the data passed to them as arguments, making them inherently safe from this category of risk.
*   **Connection Pooling:** The database connection pool was a primary area of concern. The adversarial test suite (`rls.test.js`) includes a specific test for "Connection Pool Contamination" which validates that setting the RLS session context for one request does not leak to a concurrent request using the same database connection. This proves the isolation is effective.

**Conclusion:** The current architecture shows no evidence of in-memory trust boundary violations.

## 3. Future Risks & Mitigation

As the application grows, new patterns could introduce risks if not handled carefully.

*   **Caching Layers (e.g., Redis, in-memory cache):**
    *   **Risk:** Caching data without a tenant identifier can lead to one user seeing another user's cached data.
    *   **Mitigation:** All cache keys **MUST** be namespaced with a unique tenant identifier (e.g., `userId` or `patientWyshId`). For example: `cache.set(\`patient:${patientId}:records\`, data)`.

*   **WebSockets / Real-time Communication:**
    *   **Risk:** A long-lived WebSocket connection could have a "stale" authorization context if a user's permissions change while the connection is active.
    *   **Mitigation:**
        1.  Perform a full authentication and authorization check when the WebSocket connection is first established.
        2.  For highly sensitive operations over the socket, re-validate the user's permissions against the database.
        3.  Implement a mechanism to forcefully disconnect sockets for users whose sessions have been terminated (e.g., via a pub/sub system).

*   **Singleton Objects with State:**
    *   **Risk:** Introducing a stateful singleton object (e.g., `export default new MyService()`) that stores data across requests is extremely dangerous and should be avoided.
    *   **Mitigation:** Continue the established pattern of using stateless services and request-scoped data handling.