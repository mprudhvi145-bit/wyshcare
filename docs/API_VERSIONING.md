# API Versioning Strategy

## Current State

WyshCare's backend has **zero API versioning**. All ~210 REST endpoints are served at the root:

```
GET /health
POST /auth/otp/request
GET /prescriptions
POST /telemedicine/appointments
```

There is no `/v1/`, `/v2/`, or any version prefix. There are no `Accept-Version` headers, no `X-API-Version` headers, and no content negotiation based on `Accept: application/vnd.wyshcare.v1+json`.

## Versioning Approaches Compared

### URL-based (`/v1/`, `/v2/`)

| Pros | Cons |
|---|---|
| Visually obvious | URL pollution |
| Easy to route/gateway | Can encourage fork maintenance |
| No header manipulation needed | |

### Header-based (`Accept: application/vnd.wyshcare.v1+json` or `X-API-Version: 1`)

| Pros | Cons |
|---|---|
| Clean URLs | Hidden from casual inspection |
| Content negotiation native | Harder to debug/curl |
| Single URL space | Gateway complexity |

## Recommendation: URL-based (`/v1/` prefix)

We recommend **URL-based versioning with a `/v1/` prefix** for WyshCare for the following reasons:

1. **Healthcare compliance** — Auditors and integrators need to immediately identify which API version they are calling.
2. **Mobile app compatibility** — Patient and doctor mobile apps (Flutter) need to pin an API version for their release cycle.
3. **ABDM integration** — India's ABDM gateway requires clear versioning for health data exchange.
4. **Simplicity** — No custom header parsing, works out of the box with NestJS global prefix.

### Implementation Plan

```typescript
// In main.ts
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');
```

Or for selective versioning using NestJS 11's built-in versioning:

```typescript
// In main.ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

### Migration Path

| Phase | Action | Timeline |
|---|---|---|
| Phase 1 | Add `app.setGlobalPrefix('v1')` to main.ts | Immediate |
| Phase 2 | Update frontend API calls to prepend `/v1/` | Before alpha release |
| Phase 3 | Update Flutter mobile clients | Before alpha release |
| Phase 4 | Add sunset header to old paths if backward compat needed | Optional |

## Backward Compatibility Guarantees

| Version | Status | Changes Allowed |
|---|---|---|
| v1 (current) | Active | Backward-compatible additions only (new fields, new endpoints) |
| v1.x | Patch | Bug fixes, no breaking changes |
| v2 | Future | Full breaking changes allowed |

### Backward-Compatible Changes (allowed within v1)

- Adding new optional fields to request/response bodies
- Adding new endpoints
- Adding new enum values
- Extending response objects with new fields (clients MUST ignore unknown fields)

### Breaking Changes (require v2)

- Removing or renaming fields
- Changing field types
- Making required fields optional or vice versa
- Removing endpoints
- Changing HTTP status codes
- Changing authentication requirements

## Deprecation Policy

| Step | Description | Timeline |
|---|---|---|
| 1. Announce | Add `Sunset` header to deprecated endpoints | Immediately when deprecated |
| 2. Warn | Add `Warning` header with deprecation info | 6 months before removal |
| 3. Remove | Return 410 Gone on deprecated endpoints | 6+ months after deprecation |
| 4. Archive | Remove code in next major version | 12+ months after deprecation |

### Sunset Header Format

```
Sunset: Sat, 12 Dec 2026 23:59:59 GMT
Deprecation: true
Link: </v2/endpoint>; rel="successor-version"
```

## Clients

### Frontend (Next.js)
- Hard-code `/v1/` prefix in the API client (see `lib/api-client.ts` or equivalent)
- Feature-detect response shape (ignore unknown fields)

### Mobile (Flutter)
- Use a base URL config constant: `https://api.wyshcare.com/v1`
- Pin to a specific API version in app's build config

## Future: v2 Planning

v2 should be considered when:
- The number of endpoints exceeds 500
- A major architectural change is required (e.g., migrating from REST to GraphQL-first)
- Breaking ABDM or regulatory changes are mandated
- Current API audit score falls below 5/10 without remediation
